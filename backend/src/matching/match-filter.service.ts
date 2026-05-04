import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { City } from '../location/city.entity.js';
import { DevData, JobData } from './matching.service.js';

interface CityGeo {
  id: number;
  latitude: number;
  longitude: number;
  isCapital: boolean;
}

const SENIOR_SENIORITIES = new Set(['senior', 'lead', 'specialist']);
const DEFAULT_RADIUS_CAPITAL = 40;
const DEFAULT_RADIUS_NON_CAPITAL = 20;

@Injectable()
export class MatchFilterService {
  private cityCache = new Map<number, CityGeo>();

  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  /**
   * Filters out pairs that have no chance of matching.
   * Returns only the pairs that should proceed to full score calculation.
   */
  async filterPairs(
    devs: Map<string, DevData & { maxRadiusKm?: number | null; cityId: number | null }>,
    jobs: Map<string, JobData & { maxRadiusKm?: number | null }>,
  ): Promise<{ devId: string; jobId: string }[]> {
    // Pre-load all cities we'll need
    const cityIds = new Set<number>();
    for (const [, dev] of devs) {
      if (dev.cityId) cityIds.add(dev.cityId);
    }
    for (const [, job] of jobs) {
      if (job.cityId) cityIds.add(job.cityId);
    }
    await this.preloadCities([...cityIds]);

    const surviving: { devId: string; jobId: string }[] = [];

    for (const [devId, dev] of devs) {
      for (const [jobId, job] of jobs) {
        if (this.shouldSkip(dev, job)) continue;
        surviving.push({ devId, jobId });
      }
    }

    return surviving;
  }

  /**
   * Check if a single dev-job pair should be eliminated.
   * Returns true if the pair should be SKIPPED (not calculated).
   */
  shouldSkip(
    dev: DevData & { maxRadiusKm?: number | null; cityId: number | null },
    job: JobData & { maxRadiusKm?: number | null },
  ): boolean {
    // --- Filter 1: Modality + Distance ---
    if (!this.passesModalityFilter(dev, job)) return true;

    // --- Filter 2: Salary by contract model ---
    if (!this.passesSalaryFilter(dev, job)) return true;

    return false;
  }

  private passesModalityFilter(
    dev: DevData & { maxRadiusKm?: number | null },
    job: JobData & { maxRadiusKm?: number | null },
  ): boolean {
    // Remote jobs pass for everyone
    if (job.workMode === 'remote') return true;

    // Onsite/hybrid: dev must accept this modality
    const devModes = dev.workModes ?? [];
    if (devModes.length > 0 && !devModes.includes(job.workMode)) {
      // Dev has preferences but doesn't include this modality
      // Check if dev only accepts remote
      if (devModes.length === 1 && devModes[0] === 'remote') return false;
      if (!devModes.includes('hybrid') && !devModes.includes('onsite')) return false;
    }

    // Distance check for onsite/hybrid
    if (!dev.cityId || !job.cityId) return true; // Can't eliminate without location data

    const devCity = this.cityCache.get(dev.cityId);
    const jobCity = this.cityCache.get(job.cityId);
    if (!devCity || !jobCity) return true; // Can't eliminate without geo data

    const distance = this.haversineKm(
      Number(devCity.latitude), Number(devCity.longitude),
      Number(jobCity.latitude), Number(jobCity.longitude),
    );

    // Use the smaller radius between dev and job
    const devRadius = this.getEffectiveRadius(dev.maxRadiusKm ?? null, devCity);
    const jobRadius = job.maxRadiusKm ?? 60; // Jobs default to max if not set
    const effectiveRadius = Math.min(devRadius, jobRadius);

    // Eliminate if distance exceeds effective radius
    if (distance > effectiveRadius) return false;

    return true;
  }

  private passesSalaryFilter(dev: DevData, job: JobData): boolean {
    const hasClt = job.contractModel === 'clt' || job.contractModel === 'clt_pj';
    const hasPj = job.contractModel === 'pj' || job.contractModel === 'clt_pj';

    const devHasClt = dev.salaryCltMin != null && dev.salaryCltMax != null;
    const devHasPj = dev.salaryPjMin != null && dev.salaryPjMax != null;
    const devHasAnySalary = devHasClt || devHasPj;

    // Dev has no salary info at all
    if (!devHasAnySalary) {
      // Only calculate match if job is senior+
      return SENIOR_SENIORITIES.has(job.seniority);
    }

    // Check if there's any model in common
    const commonClt = hasClt && devHasClt;
    const commonPj = hasPj && devHasPj;

    if (!commonClt && !commonPj) {
      // No model in common (e.g., dev only has CLT salary, job is PJ only)
      return false;
    }

    // For all common models, check if job_max < dev_min (dev wants more than all job ranges)
    let allBelow = true;

    if (commonClt) {
      const jobCltMax = Number(job.salaryCltMax);
      const devCltMin = Number(dev.salaryCltMin);
      if (jobCltMax >= devCltMin) allBelow = false;
    }

    if (commonPj) {
      const jobPjMax = Number(job.salaryPjMax);
      const devPjMin = Number(dev.salaryPjMin);
      if (jobPjMax >= devPjMin) allBelow = false;
    }

    // If all common models have job_max < dev_min → eliminate
    if (allBelow) return false;

    return true;
  }

  /**
   * Score 0-100 baseado em distancia + raio efetivo (Haversine).
   * Requer que as cidades de dev e job tenham sido pre-carregadas via preloadCities.
   *
   * - Vaga remote → 100 (localizacao nao se aplica)
   * - Sem dados de cidade → 50 (neutro)
   * - Distancia <= raio efetivo → 100
   * - Distancia <= raio * 1.5 → 50
   * - Distancia > raio * 1.5 → 0
   *
   * Raio efetivo = min(raio_dev, raio_vaga)
   */
  calcLocationScore(
    dev: DevData & { maxRadiusKm?: number | null; cityId: number | null },
    job: JobData & { maxRadiusKm?: number | null },
  ): number {
    if (job.workMode === 'remote') return 100;
    if (!dev.cityId || !job.cityId) return 50;

    const devCity = this.cityCache.get(dev.cityId);
    const jobCity = this.cityCache.get(job.cityId);
    if (!devCity || !jobCity) return 50;

    const distance = this.haversineKm(
      Number(devCity.latitude), Number(devCity.longitude),
      Number(jobCity.latitude), Number(jobCity.longitude),
    );

    const devRadius = this.getEffectiveRadius(dev.maxRadiusKm ?? null, devCity);
    const jobRadius = job.maxRadiusKm ?? 60;
    const effectiveRadius = Math.min(devRadius, jobRadius);

    if (distance <= effectiveRadius) return 100;
    if (distance <= effectiveRadius * 1.5) return 50;
    return 0;
  }

  private getEffectiveRadius(maxRadiusKm: number | null, city: CityGeo): number {
    if (maxRadiusKm != null) return maxRadiusKm;
    return city.isCapital ? DEFAULT_RADIUS_CAPITAL : DEFAULT_RADIUS_NON_CAPITAL;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async preloadCities(cityIds: number[]): Promise<void> {
    // Filter out already cached
    const toLoad = cityIds.filter((id) => !this.cityCache.has(id));
    if (toLoad.length === 0) return;

    const cities = await this.cityRepo.find({
      where: { id: In(toLoad) },
      select: ['id', 'latitude', 'longitude', 'isCapital'],
    });

    for (const city of cities) {
      this.cityCache.set(city.id, {
        id: city.id,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
        isCapital: city.isCapital,
      });
    }
  }
}
