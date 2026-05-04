import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

export interface IndicatorDashboard {
  general: {
    salary_avg_by_seniority: SalaryAvgRow[];
    top_skills: TopSkillRow[];
    work_mode_distribution: WorkModeRow[];
    contract_distribution: ContractRow[];
    seniority_distribution: SeniorityRow[];
    jobs_map: JobsMapCityRow[];
  };
  personal: {
    score_avg_by_seniority: ScoreAvgBySeniority[];
    score_distribution: ScoreDistRow[];
    score_weakest: ScoreWeakest;
    skills_gap: SkillGapRow[];
    skills_popularity: SkillPopRow[];
    applications_summary: ApplicationsSummary;
    profile_completeness: ProfileCompleteness;
    top_cities: TopCityRow[];
  };
}

export interface TopCityRow {
  city_id: number;
  city_name: string;
  state_abbr: string;
  state_name: string;
  job_count: number;
  avg_score: number;
  avg_clt: number | null;
  avg_pj: number | null;
}

export interface SalaryAvgRow {
  seniority: string;
  clt_avg_min: number | null;
  clt_avg_max: number | null;
  pj_avg_min: number | null;
  pj_avg_max: number | null;
  job_count: number;
}

export interface TopSkillRow {
  id: string;
  name: string;
  category: string;
  demand: number;
  avg_level: number;
}

export interface WorkModeRow {
  work_mode: string;
  count: number;
  pct: number;
}

export interface ContractRow {
  contract_model: string;
  count: number;
  pct: number;
}

export interface SeniorityRow {
  seniority: string;
  count: number;
  pct: number;
  avg_experience_years: number;
}

export interface JobsMapCityRow {
  city_id: number;
  name: string;
  state_abbr: string;
  latitude: number;
  longitude: number;
  job_count: number;
}

export interface ScoreAvgBySeniority {
  seniority: string;
  general: number;
  skills: number;
  experience: number;
  modality: number;
  salary: number;
  total_matches: number;
}

export interface ScoreDistRow {
  range: string;
  count: number;
}

export interface ScoreWeakest {
  weakest: string;
  value: number;
  suggestion: string;
}

export interface SkillGapRow {
  id: string;
  name: string;
  category: string;
  demand: number;
}

export interface SkillPopRow {
  id: string;
  name: string;
  category: string;
  level: string;
  job_demand: number;
  popularity_pct: number;
}

export interface ApplicationsSummary {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface ProfileCompleteness {
  score: number;
  missing: string[];
  sections: { name: string; label: string; weight: number; done: boolean }[];
}

export interface TopSkillByRequirement {
  skill_id: string;
  name: string;
  category: string;
  demand: number;
  demand_last_month: number;
  demand_prev_month: number;
  position: number;
  trend: 'up' | 'down' | 'stable';
  market_avg_level: number;
  market_avg_label: string;
  dev_avg_level: number;
  dev_avg_label: string;
  my_level: string | null;
  my_level_num: number | null;
}

export interface MyRequiredAnalysisRow {
  skill_id: string;
  name: string;
  category: string;
  demand: number;
  market_avg_level: number;
  market_avg_label: string;
  dev_avg_level: number;
  dev_avg_label: string;
  my_level: string;
  my_level_num: number;
  above_market: boolean;
  above_dev_avg: boolean;
  is_differential: boolean;
}

export interface MyRequiredGapRow {
  skill_id: string;
  name: string;
  category: string;
  demand: number;
  market_avg_level: number;
  market_avg_label: string;
}

export interface TopMatchesGapRow {
  skill_id: string;
  name: string;
  category: string;
  appearances: number;
  avg_required_level: number;
  required_label: string;
  my_level: string | null;
  my_level_num: number | null;
  gap_type: 'strong' | 'medium';
  best_match_score: number;
}

export interface MySkillsMarketTableRow {
  skill_id: string;
  name: string;
  category: string;
  my_level: string;
  my_level_num: number;
  total_jobs: number;
  market_avg_level: number;
  market_avg_label: string;
  jobs_dev_can_meet: number;
  dev_can_meet_pct: number;
  month_position: number | null;
  demand_last_month: number;
  demand_prev_month: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SkillsInsights {
  general: {
    top_by_requirement: {
      required: TopSkillByRequirement[];
      expected: TopSkillByRequirement[];
      differential: TopSkillByRequirement[];
    };
  };
  personal: {
    my_required_analysis: MyRequiredAnalysisRow[];
    my_required_gap: MyRequiredGapRow[];
    top_matches_gaps: TopMatchesGapRow[];
    my_skills_market_table: MySkillsMarketTableRow[];
  };
}

@Injectable({ providedIn: 'root' })
export class DevIndicatorService {
  private readonly api = inject(ApiService);

  getDashboard(): Observable<IndicatorDashboard> {
    return this.api.get<{ data: IndicatorDashboard }>('/dev/indicators').pipe(
      map((res) => res.data),
    );
  }

  getSkillsInsights(): Observable<SkillsInsights> {
    return this.api.get<{ data: SkillsInsights }>('/dev/indicators/skills').pipe(
      map((res) => res.data),
    );
  }
}
