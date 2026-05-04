/**
 * DI tokens pra ports — usados como provide tokens no MatchingModule
 * pra desacoplar o orchestrator das implementacoes concretas.
 */

export const MATCH_SCORE_REPOSITORY = Symbol('MATCH_SCORE_REPOSITORY');
export const MATCH_SCORE_CACHE = Symbol('MATCH_SCORE_CACHE');
export const APPLICATION_STATUS_READER = Symbol('APPLICATION_STATUS_READER');
export const CITY_GEO_LOADER = Symbol('CITY_GEO_LOADER');
export const DEV_JOB_DATA_LOADER = Symbol('DEV_JOB_DATA_LOADER');
