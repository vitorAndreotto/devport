import { DevData, JobData, CityGeo } from './types.js';
import {
  SENIOR_SENIORITIES,
  DEFAULT_RADIUS_CAPITAL,
  DEFAULT_RADIUS_NON_CAPITAL,
} from './constants.js';

/**
 * Regras puras de filtragem e score de localizacao.
 *
 * Recebem um Map<cityId, CityGeo> ja carregado (responsabilidade do orchestrator).
 * Sem deps de TypeORM/Postgres — testaveis diretamente passando o map.
 */

export type CityIndex = ReadonlyMap<number, CityGeo>;

/**
 * Decide se o par (dev, job) deve ser SKIPADO (nao calculado).
 * true = skip, false = calcular.
 */
export function shouldSkip(dev: DevData, job: JobData, cities: CityIndex): boolean {
  if (!passesModalityFilter(dev, job, cities)) return true;
  if (!passesSalaryFilter(dev, job)) return true;
  return false;
}

function passesModalityFilter(dev: DevData, job: JobData, cities: CityIndex): boolean {
  if (job.workMode === 'remote') return true;

  const devModes = dev.workModes ?? [];
  if (devModes.length > 0 && !devModes.includes(job.workMode)) {
    if (devModes.length === 1 && devModes[0] === 'remote') return false;
    if (!devModes.includes('hybrid') && !devModes.includes('onsite')) return false;
  }

  if (!dev.cityId || !job.cityId) return true;

  const devCity = cities.get(dev.cityId);
  const jobCity = cities.get(job.cityId);
  if (!devCity || !jobCity) return true;

  const distance = haversineKm(
    Number(devCity.latitude), Number(devCity.longitude),
    Number(jobCity.latitude), Number(jobCity.longitude),
  );

  const devRadius = getEffectiveRadius(dev.maxRadiusKm ?? null, devCity);
  const jobRadius = job.maxRadiusKm ?? 60;
  const effectiveRadius = Math.min(devRadius, jobRadius);

  if (distance > effectiveRadius) return false;
  return true;
}

function passesSalaryFilter(dev: DevData, job: JobData): boolean {
  const hasClt = job.contractModel === 'clt' || job.contractModel === 'clt_pj';
  const hasPj  = job.contractModel === 'pj'  || job.contractModel === 'clt_pj';

  const devHasClt = dev.salaryCltMin != null && dev.salaryCltMax != null;
  const devHasPj  = dev.salaryPjMin  != null && dev.salaryPjMax  != null;
  const devHasAnySalary = devHasClt || devHasPj;

  // Dev sem pretensao salarial: so calcula se a vaga for senior+
  if (!devHasAnySalary) {
    return SENIOR_SENIORITIES.has(job.seniority);
  }

  const commonClt = hasClt && devHasClt;
  const commonPj  = hasPj  && devHasPj;
  if (!commonClt && !commonPj) return false; // sem modelo em comum

  // Se em todos os modelos comuns o jobMax < devMin → elimina (dev quer mais que tudo)
  let allBelow = true;
  if (commonClt) {
    if (Number(job.salaryCltMax) >= Number(dev.salaryCltMin)) allBelow = false;
  }
  if (commonPj) {
    if (Number(job.salaryPjMax) >= Number(dev.salaryPjMin)) allBelow = false;
  }
  return !allBelow;
}

/**
 * Score 0-100 baseado em distancia (Haversine) + raio efetivo.
 *  - Vaga remote → 100 (localizacao nao se aplica)
 *  - Sem dados de cidade → 50 (neutro)
 *  - Distancia <= raio → 100
 *  - Distancia <= raio * 1.5 → 50
 *  - Distancia > raio * 1.5 → 0
 */
export function calcLocationScore(dev: DevData, job: JobData, cities: CityIndex): number {
  if (job.workMode === 'remote') return 100;
  if (!dev.cityId || !job.cityId) return 50;

  const devCity = cities.get(dev.cityId);
  const jobCity = cities.get(job.cityId);
  if (!devCity || !jobCity) return 50;

  const distance = haversineKm(
    Number(devCity.latitude), Number(devCity.longitude),
    Number(jobCity.latitude), Number(jobCity.longitude),
  );

  const devRadius = getEffectiveRadius(dev.maxRadiusKm ?? null, devCity);
  const jobRadius = job.maxRadiusKm ?? 60;
  const effectiveRadius = Math.min(devRadius, jobRadius);

  if (distance <= effectiveRadius) return 100;
  if (distance <= effectiveRadius * 1.5) return 50;
  return 0;
}

function getEffectiveRadius(maxRadiusKm: number | null, city: CityGeo): number {
  if (maxRadiusKm != null) return maxRadiusKm;
  return city.isCapital ? DEFAULT_RADIUS_CAPITAL : DEFAULT_RADIUS_NON_CAPITAL;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
