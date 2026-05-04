import { createHash } from 'crypto';
import { DevData, JobData } from './types.js';

/**
 * Hashes determinísticos pra detectar mudanças nos dados que invalidam um score
 * em cache. Usados como "version stamp" no Redis e no Postgres — quando o hash
 * muda, o cached score é invalidado.
 *
 * Funcoes puras — recebem snapshot dos dados, retornam string. Sem deps externas.
 */

export function computeDevHash(dev: DevData): string {
  const skillsSorted = [...dev.skills]
    .sort((a, b) => a.skillId.localeCompare(b.skillId))
    .map((s) => `${s.skillId}:${s.level}`)
    .join(',');

  const modesSorted = (dev.workModes ?? []).sort().join(',');
  const raw = `${dev.id}:${modesSorted}:${dev.cityId}:${dev.maxRadiusKm}:${dev.salaryCltMin}:${dev.salaryCltMax}:${dev.salaryPjMin}:${dev.salaryPjMax}:${skillsSorted}:${dev.totalExperienceMonths}`;
  return createHash('md5').update(raw).digest('hex');
}

export function computeJobHash(job: JobData): string {
  const skillsSorted = [...job.skills]
    .sort((a, b) => a.skillId.localeCompare(b.skillId))
    .map((s) => `${s.skillId}:${s.minLevel}:${s.requirement}`)
    .join(',');

  const raw = `${job.id}:${job.workMode}:${job.cityId}:${job.maxRadiusKm}:${job.contractModel}:${job.salaryCltMin}:${job.salaryCltMax}:${job.salaryPjMin}:${job.salaryPjMax}:${job.seniority}:${job.minExperienceYears}:${skillsSorted}`;
  return createHash('md5').update(raw).digest('hex');
}
