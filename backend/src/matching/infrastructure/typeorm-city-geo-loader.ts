import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { City } from '../../location/city.entity.js';
import { CityGeoLoader } from '../ports/city-geo.loader.js';
import { CityGeo } from '../domain/types.js';

/**
 * Adapter TypeORM para CityGeoLoader. Mantem cache em memoria pra evitar
 * roundtrips repetidos no Postgres ao processar batches grandes de matches.
 */
@Injectable()
export class TypeOrmCityGeoLoader implements CityGeoLoader {
  private cache = new Map<number, CityGeo>();

  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async preload(cityIds: number[]): Promise<void> {
    const toLoad = cityIds.filter((id) => !this.cache.has(id));
    if (toLoad.length === 0) return;

    const cities = await this.cityRepo.find({
      where: { id: In(toLoad) },
      select: ['id', 'latitude', 'longitude', 'isCapital'],
    });
    for (const c of cities) {
      this.cache.set(c.id, {
        id: c.id,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude),
        isCapital: c.isCapital,
      });
    }
  }

  get(cityId: number): CityGeo | undefined {
    return this.cache.get(cityId);
  }

  asMap(): ReadonlyMap<number, CityGeo> {
    return this.cache;
  }
}
