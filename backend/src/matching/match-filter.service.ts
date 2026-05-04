import { Inject, Injectable } from '@nestjs/common';
import type { DevData, JobData } from './domain/types.js';
import {
  shouldSkip as filterShouldSkip,
  calcLocationScore as filterCalcLocationScore,
} from './domain/filter-rules.js';
import type { CityGeoLoader } from './ports/city-geo.loader.js';
import { CITY_GEO_LOADER } from './ports/tokens.js';

/**
 * Facade fina que preserva a API publica usada pelo MatchBatchConsumer
 * (`shouldSkip`, `preloadCities`) e qualquer outro caller externo.
 *
 * Internamente delega 100% pra `domain/filter-rules.ts` (puro) usando o
 * CityGeoLoader. Sem logica de DB ou queries — tudo isso ficou no adapter.
 */
@Injectable()
export class MatchFilterService {
  constructor(
    @Inject(CITY_GEO_LOADER)
    private readonly cities: CityGeoLoader,
  ) {}

  async preloadCities(cityIds: number[]): Promise<void> {
    await this.cities.preload(cityIds);
  }

  shouldSkip(dev: DevData, job: JobData): boolean {
    return filterShouldSkip(dev, job, this.cities.asMap());
  }

  calcLocationScore(dev: DevData, job: JobData): number {
    return filterCalcLocationScore(dev, job, this.cities.asMap());
  }
}
