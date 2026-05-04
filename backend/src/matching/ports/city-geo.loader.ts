import { CityGeo } from '../domain/types.js';

/**
 * Port pra carregar dados geograficos de cidades.
 *
 * O adapter pode (e provavelmente deve) manter cache interno pra evitar hits
 * repetidos no DB — por isso a separacao de `preload` (popula) e `get` (lookup).
 *
 * Adapter padrao: TypeOrmCityGeoLoader (cache em memoria + queries por id).
 */
export interface CityGeoLoader {
  /** Carrega as cidades por id. Idempotente (skips ja cacheadas). */
  preload(cityIds: number[]): Promise<void>;
  /** Lookup sincrono — retorna undefined se nao foi pre-carregada. */
  get(cityId: number): CityGeo | undefined;
  /** Snapshot do cache atual como Map (pra passar pras funcoes puras). */
  asMap(): ReadonlyMap<number, CityGeo>;
}
