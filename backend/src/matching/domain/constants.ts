/**
 * Constantes do dominio de matching — sem deps externas.
 */

/** TTL do Redis pra match comum (score < threshold e nao aplicou). */
export const REDIS_TTL_DEFAULT = 1800; // 30min

/** TTL do Redis pra match relevante (score >= threshold OU dev candidato com vaga aberta). */
export const REDIS_TTL_RELEVANT = 21600; // 6h

/** Score minimo pra considerar o par "relevante" (e portanto persistir). */
export const RELEVANCE_THRESHOLD = 75;

/** Senioridades consideradas "senior+" pro filtro de salario. */
export const SENIOR_SENIORITIES = new Set(['senior', 'lead', 'specialist']);

/** Raio default em km quando o dev/job nao define maxRadiusKm. */
export const DEFAULT_RADIUS_CAPITAL = 40;
export const DEFAULT_RADIUS_NON_CAPITAL = 20;

/** Ordem dos niveis de skill. */
export const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

/**
 * Tabela de compatibilidade [devLevel][jobMinLevel] → percentual.
 * Dev acima do exigido recebe bonus (>100), abaixo recebe pontuacao reduzida.
 */
export const LEVEL_COMPAT: Record<string, Record<string, number>> = {
  beginner:     { beginner: 100, intermediate: 70,  advanced: 50,  expert: 30  },
  intermediate: { beginner: 120, intermediate: 100, advanced: 70,  expert: 50  },
  advanced:     { beginner: 150, intermediate: 120, advanced: 100, expert: 70  },
  expert:       { beginner: 150, intermediate: 150, advanced: 120, expert: 100 },
};

/** Peso de cada tipo de exigencia da skill no score final. */
export const REQ_WEIGHT: Record<string, number> = {
  required: 3,
  expected: 2,
  differential: 1,
};

/** Pesos das 4 dimensoes do score final (skills/experience/modality/salary). */
export const SCORE_WEIGHTS = {
  skills: 0.50,
  experience: 0.25,
  modality: 0.10,
  salary: 0.15,
} as const;
