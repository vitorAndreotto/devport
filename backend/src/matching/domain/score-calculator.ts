import { DevData, JobData, MatchResult } from './types.js';
import { LEVEL_COMPAT, REQ_WEIGHT, SCORE_WEIGHTS } from './constants.js';

/**
 * Logica pura de calculo de match score. Nao toca DB/Redis — recebe um snapshot
 * dos dados (DevData/JobData) e retorna o resultado.
 *
 * O score de localizacao (parte de modalidade pra vagas hybrid/onsite) deve ser
 * calculado externamente via filter-rules.calcLocationScore() e injetado aqui,
 * porque depende do CityIndex carregado pelo orchestrator.
 */

/**
 * Computa o MatchResult final.
 * @param locationScore Pre-calculado via calcLocationScore(). Ignorado em vagas remote.
 */
export function calculate(
  dev: DevData,
  job: JobData,
  devHash: string,
  jobHash: string,
  locationScore: number,
): MatchResult {
  const skillScore     = calcSkills(dev, job);
  const experienceScore = calcExperience(dev, job);
  const modalityScore  = calcModality(dev, job, locationScore);
  const salaryScore    = calcSalary(dev, job);

  const score = Math.round(
    skillScore     * SCORE_WEIGHTS.skills +
    experienceScore * SCORE_WEIGHTS.experience +
    modalityScore  * SCORE_WEIGHTS.modality +
    salaryScore    * SCORE_WEIGHTS.salary,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    skillScore: round2(skillScore),
    experienceScore: round2(experienceScore),
    modalityScore: round2(modalityScore),
    salaryScore: round2(salaryScore),
    devHash,
    jobHash,
  };
}

export function calcSkills(dev: DevData, job: JobData): number {
  if (job.skills.length === 0) return 50;

  const devSkillMap = new Map(dev.skills.map((s) => [s.skillId, s.level]));
  let weightedSum = 0;
  let maxWeighted = 0;

  for (const js of job.skills) {
    const weight = REQ_WEIGHT[js.requirement] ?? 1;
    maxWeighted += 100 * weight;
    const devLevel = devSkillMap.get(js.skillId);
    if (!devLevel) continue;
    const compat = LEVEL_COMPAT[devLevel]?.[js.minLevel] ?? 0;
    weightedSum += Math.min(100, compat) * weight;
  }

  return maxWeighted > 0 ? (weightedSum / maxWeighted) * 100 : 50;
}

export function calcExperience(dev: DevData, job: JobData): number {
  if (job.minExperienceYears === 0) return 100;
  const devYears = dev.totalExperienceMonths / 12;
  if (devYears >= job.minExperienceYears) return 100;
  return (devYears / job.minExperienceYears) * 100;
}

/**
 * Score de modalidade (10% do score final).
 *  - Vaga remote: 100 se aceita, 0 se nao.
 *  - Vaga hybrid/onsite: aceitacao da modalidade × 25% + locationScore × 75%.
 */
export function calcModality(dev: DevData, job: JobData, locationScore: number): number {
  const devModes = dev.workModes;
  const noPreference = !devModes || devModes.length === 0;
  const acceptsMode = noPreference || devModes!.includes(job.workMode);

  if (job.workMode === 'remote') return acceptsMode ? 100 : 0;

  const modalityPart = acceptsMode ? 100 : 0;
  return modalityPart * 0.25 + locationScore * 0.75;
}

export function calcSalary(dev: DevData, job: JobData): number {
  const hasClt = job.contractModel === 'clt' || job.contractModel === 'clt_pj';
  const hasPj  = job.contractModel === 'pj'  || job.contractModel === 'clt_pj';

  const pairs: { devMin: number; devMax: number; jobMin: number; jobMax: number }[] = [];

  if (hasClt && dev.salaryCltMin && dev.salaryCltMax && job.salaryCltMin && job.salaryCltMax) {
    pairs.push({
      devMin: Number(dev.salaryCltMin), devMax: Number(dev.salaryCltMax),
      jobMin: Number(job.salaryCltMin), jobMax: Number(job.salaryCltMax),
    });
  }
  if (hasPj && dev.salaryPjMin && dev.salaryPjMax && job.salaryPjMin && job.salaryPjMax) {
    pairs.push({
      devMin: Number(dev.salaryPjMin), devMax: Number(dev.salaryPjMax),
      jobMin: Number(job.salaryPjMin), jobMax: Number(job.salaryPjMax),
    });
  }

  if (pairs.length === 0) return 50; // neutro — sem modelo comparavel

  let best = 0;
  for (const p of pairs) {
    best = Math.max(best, calcSalaryPair(p.devMin, p.devMax, p.jobMin, p.jobMax));
  }
  return best;
}

export function calcSalaryPair(devMin: number, devMax: number, jobMin: number, jobMax: number): number {
  const overlapStart = Math.max(devMin, jobMin);
  const overlapEnd   = Math.min(devMax, jobMax);

  if (overlapStart > overlapEnd) {
    if (devMin > jobMax) return 0;
    if (devMax < jobMin) {
      const bonus = Math.min(10, ((jobMin - devMax) / devMax) * 100);
      return Math.min(110, 100 + bonus);
    }
  }

  const overlap = overlapEnd - overlapStart;
  const range   = Math.max(devMax, jobMax) - Math.min(devMin, jobMin);

  if (range === 0) return 100;

  const baseScore = (overlap / range) * 100;

  if (devMin >= jobMin && devMax <= jobMax) {
    const bonus = Math.min(10, ((jobMax - devMax) / devMax) * 50);
    return Math.min(110, baseScore + bonus);
  }
  return baseScore;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
