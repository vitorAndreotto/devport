/**
 * Tipos de dados do dominio de matching — interfaces puras, sem deps externas.
 * Funcionam como Data Transfer Objects (DTOs) entre as camadas application/domain/infrastructure.
 */

export interface DevData {
  id: string;
  workModes: string[] | null;
  cityId: number | null;
  maxRadiusKm?: number | null;
  salaryCltMin: number | null;
  salaryCltMax: number | null;
  salaryPjMin: number | null;
  salaryPjMax: number | null;
  skills: { skillId: string; level: string }[];
  totalExperienceMonths: number;
}

export interface JobData {
  id: string;
  workMode: string;
  cityId: number | null;
  cityStateId: number | null;
  maxRadiusKm?: number | null;
  salaryCltMin: number | null;
  salaryCltMax: number | null;
  salaryPjMin: number | null;
  salaryPjMax: number | null;
  contractModel: string;
  seniority: string;
  minExperienceYears: number;
  skills: { skillId: string; minLevel: string; requirement: string }[];
}

/** Resultado completo de um calculo de match. */
export interface MatchResult {
  score: number;
  skillScore: number;
  experienceScore: number;
  modalityScore: number;
  salaryScore: number;
  devHash: string;
  jobHash: string;
}

/** Dados geograficos de uma cidade — usados pelo filtro/score de localizacao. */
export interface CityGeo {
  id: number;
  latitude: number;
  longitude: number;
  isCapital: boolean;
}
