import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../matching/redis.provider.js';
import { MatchScore } from '../matching/match-score.entity.js';
import { Job } from '../job/job.entity.js';
import { JobSkill } from '../job/job-skill.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';

// =============================================
// TTL config
// =============================================

const TTL = {
  GLOBAL: 21600,         // 6h
  DEV_SCORE: 10800,      // 3h
  DEV_SKILLS: 10800,     // 3h
  DEV_APPLICATIONS: 1800, // 30min
  DEV_PROFILE: 43200,    // 12h
} as const;

// =============================================
// Key builders
// =============================================

const KEY = {
  // Global — entity HASH
  globalSkillDevs: (skillId: string) => `indicator:global:skill:${skillId}:devs`,
  globalSkillJobs: (skillId: string) => `indicator:global:skill:${skillId}:jobs`,
  globalSeniorityJobs: (seniority: string) => `indicator:global:seniority:${seniority}:jobs`,
  globalWorkModeJobs: (mode: string) => `indicator:global:work_mode:${mode}:jobs`,
  globalContractJobs: (model: string) => `indicator:global:contract:${model}:jobs`,
  globalRanking: (kind: 'overall' | 'required' | 'expected' | 'differential') => `indicator:global:ranking:top_skills:${kind}`,
  globalJobsMap: () => `indicator:global:jobs_map`,

  // Dev — score
  devScore: (devId: string) => `indicator:dev:${devId}:score`,
  devScoreSeniority: (devId: string, seniority: string) => `indicator:dev:${devId}:score:seniority:${seniority}`,
  devScoreSeniorityIndex: (devId: string) => `indicator:dev:${devId}:score:seniorities`,  // SET
  devScoreDistribution: (devId: string) => `indicator:dev:${devId}:score:distribution`,

  // Dev — skills
  devSkillsTop: (devId: string) => `indicator:dev:${devId}:skills:top`,
  devSkillsGap: (devId: string) => `indicator:dev:${devId}:skills:gap`,
  devSkillsDifferentials: (devId: string) => `indicator:dev:${devId}:skills:differentials`,
  devSkillsToImprove: (devId: string) => `indicator:dev:${devId}:skills:to_improve`,
  devSkillsTopMatchesGaps: (devId: string) => `indicator:dev:${devId}:skills:top_matches_gaps`,
  devSkillsMarketTable: (devId: string) => `indicator:dev:${devId}:skills:market_table`,

  // Dev — applications + profile + cities
  devApplications: (devId: string) => `indicator:dev:${devId}:applications`,
  devProfileCompleteness: (devId: string) => `indicator:dev:${devId}:profile:completeness`,
  devProfileCompletenessSections: (devId: string) => `indicator:dev:${devId}:profile:completeness:sections`,
  devTopCities: (devId: string) => `indicator:dev:${devId}:top_cities`,
} as const;

// =============================================
// Helpers
// =============================================

function num(v: string | undefined | null): number {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function levelLabel(avg: number): string {
  if (avg >= 3.5) return 'expert';
  if (avg >= 2.5) return 'advanced';
  if (avg >= 1.5) return 'intermediate';
  if (avg > 0) return 'beginner';
  return 'n/a';
}

@Injectable()
export class DevIndicatorService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectRepository(MatchScore)
    private readonly matchRepo: Repository<MatchScore>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(JobSkill)
    private readonly jobSkillRepo: Repository<JobSkill>,
    @InjectRepository(DevSkill)
    private readonly devSkillRepo: Repository<DevSkill>,
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(DevProfile)
    private readonly devProfileRepo: Repository<DevProfile>,
  ) {}

  // =============================================
  // Cache primitives (HASH and JSON)
  // =============================================

  private async getHash(key: string): Promise<Record<string, string> | null> {
    const data = await this.redis.hgetall(key);
    return data && Object.keys(data).length > 0 ? data : null;
  }

  private async setHash(key: string, fields: Record<string, string | number>, ttl: number): Promise<void> {
    const pipeline = this.redis.multi();
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) flat[k] = String(v);
    pipeline.hset(key, flat);
    pipeline.expire(key, ttl);
    await pipeline.exec();
  }

  private async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  private async setJson<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  // =============================================
  // GLOBAL — Seniority jobs (HASH)
  // =============================================

  async getSeniorityJobs(seniority: string): Promise<{
    count: number;
    clt_avg_min: number; clt_avg_max: number;
    pj_avg_min: number; pj_avg_max: number;
    avg_experience_years: number;
  }> {
    const key = KEY.globalSeniorityJobs(seniority);
    const cached = await this.getHash(key);
    if (cached && cached.avg_experience_years !== undefined) {
      return {
        count: num(cached.count),
        clt_avg_min: num(cached.clt_avg_min), clt_avg_max: num(cached.clt_avg_max),
        pj_avg_min: num(cached.pj_avg_min), pj_avg_max: num(cached.pj_avg_max),
        avg_experience_years: num(cached.avg_experience_years),
      };
    }

    const row = await this.jobRepo.query(`
      SELECT
        COUNT(*) as count,
        COALESCE(ROUND(AVG(salary_clt_min)::numeric, 0), 0) as clt_avg_min,
        COALESCE(ROUND(AVG(salary_clt_max)::numeric, 0), 0) as clt_avg_max,
        COALESCE(ROUND(AVG(salary_pj_min)::numeric, 0), 0) as pj_avg_min,
        COALESCE(ROUND(AVG(salary_pj_max)::numeric, 0), 0) as pj_avg_max,
        COALESCE(ROUND(AVG(min_experience_years)::numeric, 1), 0) as avg_experience_years
      FROM jobs WHERE status = 'open' AND seniority = $1
    `, [seniority]);

    const result = {
      count: num(row[0]?.count),
      clt_avg_min: num(row[0]?.clt_avg_min), clt_avg_max: num(row[0]?.clt_avg_max),
      pj_avg_min: num(row[0]?.pj_avg_min), pj_avg_max: num(row[0]?.pj_avg_max),
      avg_experience_years: num(row[0]?.avg_experience_years),
    };
    await this.setHash(key, result, TTL.GLOBAL);
    return result;
  }

  async getSalaryAvgBySeniority(): Promise<any[]> {
    const seniorities = ['intern', 'junior', 'mid', 'senior', 'lead', 'specialist'];
    const results = await Promise.all(seniorities.map(async (s) => {
      const data = await this.getSeniorityJobs(s);
      return { seniority: s, ...data, job_count: data.count };
    }));
    return results.filter((r) => r.count > 0);
  }

  async getSeniorityDistribution(): Promise<{ seniority: string; count: number; pct: number; avg_experience_years: number }[]> {
    const seniorities = ['intern', 'junior', 'mid', 'senior', 'lead', 'specialist'];
    const data = await Promise.all(seniorities.map(async (s) => {
      const d = await this.getSeniorityJobs(s);
      return { seniority: s, count: d.count, avg_experience_years: d.avg_experience_years };
    }));
    const total = data.reduce((acc, d) => acc + d.count, 0);
    if (total === 0) return [];
    return data
      .filter((d) => d.count > 0)
      .map((d) => ({ ...d, pct: Math.round((d.count / total) * 1000) / 10 }));
  }

  // =============================================
  // GLOBAL — Work mode (HASH)
  // =============================================

  async getWorkModeJobs(mode: string): Promise<{ count: number; pct: number }> {
    const key = KEY.globalWorkModeJobs(mode);
    const cached = await this.getHash(key);
    if (cached) return { count: num(cached.count), pct: num(cached.pct) };

    // We need totals from all modes to compute pct — populate all at once
    await this.populateWorkModeJobsAll();
    const fresh = await this.getHash(key);
    return fresh ? { count: num(fresh.count), pct: num(fresh.pct) } : { count: 0, pct: 0 };
  }

  private async populateWorkModeJobsAll(): Promise<void> {
    const rows = await this.jobRepo.query(`
      SELECT work_mode,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pct
      FROM jobs WHERE status = 'open'
      GROUP BY work_mode
    `);
    await Promise.all(rows.map((r: any) =>
      this.setHash(KEY.globalWorkModeJobs(r.work_mode), { count: r.count, pct: r.pct }, TTL.GLOBAL),
    ));
  }

  // =============================================
  // GLOBAL — Contract model (HASH)
  // =============================================

  async getContractJobs(model: string): Promise<{ count: number; pct: number }> {
    const key = KEY.globalContractJobs(model);
    const cached = await this.getHash(key);
    if (cached) return { count: num(cached.count), pct: num(cached.pct) };

    await this.populateContractJobsAll();
    const fresh = await this.getHash(key);
    return fresh ? { count: num(fresh.count), pct: num(fresh.pct) } : { count: 0, pct: 0 };
  }

  private async populateContractJobsAll(): Promise<void> {
    const rows = await this.jobRepo.query(`
      SELECT contract_model,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pct
      FROM jobs WHERE status = 'open'
      GROUP BY contract_model
    `);
    await Promise.all(rows.map((r: any) =>
      this.setHash(KEY.globalContractJobs(r.contract_model), { count: r.count, pct: r.pct }, TTL.GLOBAL),
    ));
  }

  async getContractDistribution(): Promise<{ contract_model: string; count: number; pct: number }[]> {
    const models = ['clt', 'pj', 'clt_pj'];
    const results = await Promise.all(models.map(async (m) => ({ contract_model: m, ...(await this.getContractJobs(m)) })));
    return results.filter((r) => r.count > 0);
  }

  async getWorkModeDistribution(): Promise<any[]> {
    const modes = ['remote', 'hybrid', 'onsite'];
    const results = await Promise.all(modes.map(async (m) => ({ work_mode: m, ...(await this.getWorkModeJobs(m)) })));
    return results.filter((r) => r.count > 0);
  }

  // =============================================
  // GLOBAL — Mapa de vagas por cidade (JSON)
  // =============================================

  /**
   * Top 100 cidades com mais vagas abertas (presencial/hibrido), incluindo lat/long
   * para plotagem em mapa. Vagas remote nao entram porque nao tem cidade definida.
   */
  async getJobsMapByCity(): Promise<{
    city_id: number;
    name: string;
    state_abbr: string;
    latitude: number;
    longitude: number;
    job_count: number;
  }[]> {
    const key = KEY.globalJobsMap();
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const rows = await this.jobRepo.query(`
      SELECT
        c.id          AS city_id,
        c.name        AS name,
        st.abbr       AS state_abbr,
        c.latitude    AS latitude,
        c.longitude   AS longitude,
        COUNT(j.id)::int AS job_count
      FROM jobs j
      JOIN cities c ON c.id = j.city_id
      JOIN states st ON st.id = c.state_id
      WHERE j.status = 'open' AND j.city_id IS NOT NULL
      GROUP BY c.id, c.name, st.abbr, c.latitude, c.longitude
      ORDER BY job_count DESC
      LIMIT 100
    `);

    const result = rows.map((r: any) => ({
      city_id: num(r.city_id),
      name: r.name,
      state_abbr: r.state_abbr,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      job_count: num(r.job_count),
    }));

    await this.setJson(key, result, TTL.GLOBAL);
    return result;
  }

  // =============================================
  // GLOBAL — Skill jobs (HASH per skill)
  // =============================================

  async getSkillJobs(skillId: string): Promise<{
    total: number;
    required: number; expected: number; differential: number;
    min_level_beginner: number; min_level_intermediate: number;
    min_level_advanced: number; min_level_expert: number;
    avg_min_level: number;
  }> {
    const key = KEY.globalSkillJobs(skillId);
    const cached = await this.getHash(key);
    if (cached) {
      return {
        total: num(cached.total),
        required: num(cached.required), expected: num(cached.expected), differential: num(cached.differential),
        min_level_beginner: num(cached.min_level_beginner), min_level_intermediate: num(cached.min_level_intermediate),
        min_level_advanced: num(cached.min_level_advanced), min_level_expert: num(cached.min_level_expert),
        avg_min_level: num(cached.avg_min_level),
      };
    }

    const row = await this.jobSkillRepo.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE js.requirement = 'required') as required,
        COUNT(*) FILTER (WHERE js.requirement = 'expected') as expected,
        COUNT(*) FILTER (WHERE js.requirement = 'differential') as differential,
        COUNT(*) FILTER (WHERE js.min_level = 'beginner') as min_level_beginner,
        COUNT(*) FILTER (WHERE js.min_level = 'intermediate') as min_level_intermediate,
        COUNT(*) FILTER (WHERE js.min_level = 'advanced') as min_level_advanced,
        COUNT(*) FILTER (WHERE js.min_level = 'expert') as min_level_expert,
        COALESCE(ROUND(AVG(CASE js.min_level
          WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END)::numeric, 1), 0) as avg_min_level
      FROM job_skills js
      JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
      WHERE js.skill_id = $1
    `, [skillId]);

    const result = {
      total: num(row[0]?.total),
      required: num(row[0]?.required), expected: num(row[0]?.expected), differential: num(row[0]?.differential),
      min_level_beginner: num(row[0]?.min_level_beginner), min_level_intermediate: num(row[0]?.min_level_intermediate),
      min_level_advanced: num(row[0]?.min_level_advanced), min_level_expert: num(row[0]?.min_level_expert),
      avg_min_level: num(row[0]?.avg_min_level),
    };
    await this.setHash(key, result, TTL.GLOBAL);
    return result;
  }

  async getSkillDevs(skillId: string): Promise<{
    total: number;
    beginner: number; intermediate: number; advanced: number; expert: number;
    avg_years: number;
  }> {
    const key = KEY.globalSkillDevs(skillId);
    const cached = await this.getHash(key);
    if (cached) {
      return {
        total: num(cached.total),
        beginner: num(cached.beginner), intermediate: num(cached.intermediate),
        advanced: num(cached.advanced), expert: num(cached.expert),
        avg_years: num(cached.avg_years),
      };
    }

    const row = await this.devSkillRepo.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE level = 'beginner') as beginner,
        COUNT(*) FILTER (WHERE level = 'intermediate') as intermediate,
        COUNT(*) FILTER (WHERE level = 'advanced') as advanced,
        COUNT(*) FILTER (WHERE level = 'expert') as expert,
        COALESCE(ROUND(AVG(years_experience)::numeric, 1), 0) as avg_years
      FROM dev_skills WHERE skill_id = $1
    `, [skillId]);

    const result = {
      total: num(row[0]?.total),
      beginner: num(row[0]?.beginner), intermediate: num(row[0]?.intermediate),
      advanced: num(row[0]?.advanced), expert: num(row[0]?.expert),
      avg_years: num(row[0]?.avg_years),
    };
    await this.setHash(key, result, TTL.GLOBAL);
    return result;
  }

  // =============================================
  // GLOBAL — Top skills rankings (JSON)
  // =============================================

  /**
   * Top 10 skills mais pedidas no ULTIMO MES (vagas com created_at >= 30 dias atras).
   * Inclui posicao no ranking, demanda do mes anterior e tendencia (up/down/stable).
   */
  async getTopSkillsRanking(kind: 'overall' | 'required' | 'expected' | 'differential' = 'overall'): Promise<{
    skill_id: string;
    demand: number;
    demand_last_month: number;
    demand_prev_month: number;
    position: number;
    trend: 'up' | 'down' | 'stable';
  }[]> {
    const key = KEY.globalRanking(kind);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const reqFilter = kind === 'overall' ? '' : `AND js.requirement = '${kind}'`;
    const rows = await this.jobSkillRepo.query(`
      WITH last_month AS (
        SELECT js.skill_id, COUNT(*) AS d
        FROM job_skills js
        JOIN jobs j ON j.id = js.job_id
        WHERE j.created_at >= NOW() - INTERVAL '30 days' ${reqFilter}
        GROUP BY js.skill_id
      ),
      prev_month AS (
        SELECT js.skill_id, COUNT(*) AS d
        FROM job_skills js
        JOIN jobs j ON j.id = js.job_id
        WHERE j.created_at >= NOW() - INTERVAL '60 days'
          AND j.created_at <  NOW() - INTERVAL '30 days'
          ${reqFilter}
        GROUP BY js.skill_id
      )
      SELECT
        l.skill_id,
        l.d AS demand_last_month,
        COALESCE(p.d, 0) AS demand_prev_month,
        ROW_NUMBER() OVER (ORDER BY l.d DESC) AS position
      FROM last_month l
      LEFT JOIN prev_month p ON p.skill_id = l.skill_id
      ORDER BY l.d DESC
      LIMIT 10
    `);

    const result = rows.map((r: any) => {
      const demandLast = num(r.demand_last_month);
      const demandPrev = num(r.demand_prev_month);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (demandLast > demandPrev) trend = 'up';
      else if (demandLast < demandPrev) trend = 'down';

      return {
        skill_id: r.skill_id,
        demand: demandLast,            // back-compat
        demand_last_month: demandLast,
        demand_prev_month: demandPrev,
        position: num(r.position),
        trend,
      };
    });

    await this.setJson(key, result, TTL.GLOBAL);
    return result;
  }

  // =============================================
  // GLOBAL — Composite getters (compose granular keys)
  // =============================================

  async getTopSkills(): Promise<any[]> {
    const ranking = await this.getTopSkillsRanking('overall');
    if (ranking.length === 0) return [];

    const skillIds = ranking.map((r) => r.skill_id);
    const skillsMeta = await this.jobSkillRepo.query(`
      SELECT id, name, category FROM skill_tree WHERE id = ANY($1)
    `, [skillIds]);
    const metaMap = new Map(skillsMeta.map((s: any) => [s.id, s]));

    const enriched = await Promise.all(ranking.map(async (r) => {
      const meta = metaMap.get(r.skill_id) as any;
      const jobsData = await this.getSkillJobs(r.skill_id);
      return {
        id: r.skill_id,
        name: meta?.name ?? 'Unknown',
        category: meta?.category ?? 'other',
        demand: r.demand,
        avg_level: jobsData.avg_min_level,
      };
    }));

    return enriched;
  }

  async getSkillsTopByRequirement(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = { required: [], expected: [], differential: [] };

    for (const kind of ['required', 'expected', 'differential'] as const) {
      const ranking = await this.getTopSkillsRanking(kind);
      if (ranking.length === 0) continue;

      const skillIds = ranking.map((r) => r.skill_id);
      const meta = await this.jobSkillRepo.query(`
        SELECT id, name, category FROM skill_tree WHERE id = ANY($1)
      `, [skillIds]);
      const metaMap = new Map(meta.map((s: any) => [s.id, s]));

      result[kind] = await Promise.all(ranking.map(async (r) => {
        const m = metaMap.get(r.skill_id) as any;
        const jobs = await this.getSkillJobs(r.skill_id);
        const devs = await this.getSkillDevs(r.skill_id);

        // For requirement-specific avg level, we need to query — overall is in HASH
        // We use the overall avg as approximation for now (avoids extra query per skill)
        const devLevelAvg = devs.total > 0
          ? (devs.beginner * 1 + devs.intermediate * 2 + devs.advanced * 3 + devs.expert * 4) / devs.total
          : 0;

        return {
          skill_id: r.skill_id,
          name: m?.name ?? 'Unknown',
          category: m?.category ?? 'other',
          demand: r.demand,
          demand_last_month: r.demand_last_month,
          demand_prev_month: r.demand_prev_month,
          position: r.position,
          trend: r.trend,
          market_avg_level: jobs.avg_min_level,
          market_avg_label: levelLabel(jobs.avg_min_level),
          dev_avg_level: Math.round(devLevelAvg * 10) / 10,
          dev_avg_label: levelLabel(devLevelAvg),
        };
      }));
    }

    return result;
  }

  // =============================================
  // DEV — Score (HASH per scope)
  // =============================================

  async getDevScore(devProfileId: string): Promise<{
    avg_general: number; avg_skills: number; avg_experience: number;
    avg_modality: number; avg_salary: number; total_matches: number;
    weakest: string; weakest_value: number;
  }> {
    const key = KEY.devScore(devProfileId);
    const cached = await this.getHash(key);
    if (cached) {
      return {
        avg_general: num(cached.avg_general), avg_skills: num(cached.avg_skills),
        avg_experience: num(cached.avg_experience), avg_modality: num(cached.avg_modality),
        avg_salary: num(cached.avg_salary), total_matches: num(cached.total_matches),
        weakest: cached.weakest ?? 'skills', weakest_value: num(cached.weakest_value),
      };
    }

    const row = await this.matchRepo.query(`
      SELECT
        COALESCE(ROUND(AVG(score)::numeric, 1), 0) as avg_general,
        COALESCE(ROUND(AVG(skill_score)::numeric, 1), 0) as avg_skills,
        COALESCE(ROUND(AVG(experience_score)::numeric, 1), 0) as avg_experience,
        COALESCE(ROUND(AVG(modality_score)::numeric, 1), 0) as avg_modality,
        COALESCE(ROUND(AVG(salary_score)::numeric, 1), 0) as avg_salary,
        COUNT(*) as total_matches
      FROM match_scores WHERE dev_profile_id = $1
    `, [devProfileId]);

    const r = row[0] ?? {};
    const subs = {
      skills: num(r.avg_skills), experience: num(r.avg_experience),
      modality: num(r.avg_modality), salary: num(r.avg_salary),
    };
    const weakest = Object.entries(subs).reduce((min, [k, v]) =>
      v < min.value ? { key: k, value: v } : min,
      { key: 'skills', value: Infinity },
    );

    const result = {
      avg_general: num(r.avg_general), avg_skills: subs.skills,
      avg_experience: subs.experience, avg_modality: subs.modality, avg_salary: subs.salary,
      total_matches: num(r.total_matches),
      weakest: weakest.value === Infinity ? 'skills' : weakest.key,
      weakest_value: weakest.value === Infinity ? 0 : weakest.value,
    };
    await this.setHash(key, result, TTL.DEV_SCORE);
    return result;
  }

  async getScoreAvgBySeniority(devProfileId: string): Promise<any[]> {
    const indexKey = KEY.devScoreSeniorityIndex(devProfileId);

    // Try to read seniorities index
    let seniorities = await this.redis.smembers(indexKey);

    if (seniorities.length === 0) {
      // Populate all at once
      const rows = await this.matchRepo.query(`
        SELECT
          j.seniority,
          ROUND(AVG(ms.score)::numeric, 1) as general,
          ROUND(AVG(ms.skill_score)::numeric, 1) as skills,
          ROUND(AVG(ms.experience_score)::numeric, 1) as experience,
          ROUND(AVG(ms.modality_score)::numeric, 1) as modality,
          ROUND(AVG(ms.salary_score)::numeric, 1) as salary,
          COUNT(*) as total_matches
        FROM match_scores ms
        JOIN jobs j ON j.id = ms.job_id
        WHERE ms.dev_profile_id = $1
        GROUP BY j.seniority
        ORDER BY AVG(ms.score) DESC
      `, [devProfileId]);

      if (rows.length === 0) return [];

      const pipeline = this.redis.multi();
      for (const r of rows) {
        const k = KEY.devScoreSeniority(devProfileId, r.seniority);
        const flat: Record<string, string> = {
          general: String(r.general), skills: String(r.skills),
          experience: String(r.experience), modality: String(r.modality),
          salary: String(r.salary), total_matches: String(r.total_matches),
        };
        pipeline.hset(k, flat);
        pipeline.expire(k, TTL.DEV_SCORE);
        pipeline.sadd(indexKey, r.seniority);
      }
      pipeline.expire(indexKey, TTL.DEV_SCORE);
      await pipeline.exec();

      seniorities = rows.map((r: any) => r.seniority);
    }

    // Read all
    const results = await Promise.all(seniorities.map(async (s) => {
      const cached = await this.getHash(KEY.devScoreSeniority(devProfileId, s));
      return {
        seniority: s,
        general: num(cached?.general), skills: num(cached?.skills),
        experience: num(cached?.experience), modality: num(cached?.modality),
        salary: num(cached?.salary), total_matches: num(cached?.total_matches),
      };
    }));

    return results.sort((a, b) => b.general - a.general);
  }

  async getScoreDistribution(devProfileId: string): Promise<any[]> {
    const key = KEY.devScoreDistribution(devProfileId);
    const cached = await this.getHash(key);
    if (cached) {
      return Object.entries(cached)
        .map(([range, count]) => ({ range, count: num(count) }))
        .sort((a, b) => a.range.localeCompare(b.range));
    }

    const rows = await this.matchRepo.query(`
      SELECT
        CASE
          WHEN score < 20 THEN '0-19'
          WHEN score < 40 THEN '20-39'
          WHEN score < 60 THEN '40-59'
          WHEN score < 80 THEN '60-79'
          ELSE '80-100'
        END as range,
        COUNT(*) as count
      FROM match_scores WHERE dev_profile_id = $1
      GROUP BY range
    `, [devProfileId]);

    if (rows.length === 0) return [];

    const fields: Record<string, number> = {};
    for (const r of rows) fields[r.range] = num(r.count);
    await this.setHash(key, fields, TTL.DEV_SCORE);

    return rows.map((r: any) => ({ range: r.range, count: num(r.count) })).sort((a: any, b: any) => a.range.localeCompare(b.range));
  }

  async getScoreWeakest(devProfileId: string): Promise<{ weakest: string; value: number; suggestion: string }> {
    const score = await this.getDevScore(devProfileId);
    const suggestions: Record<string, string> = {
      skills: 'Adicione skills em alta demanda para melhorar seu match técnico.',
      experience: 'Vagas costumam pedir mais experiência. Mantenha seu histórico atualizado.',
      modality: 'Considere aceitar mais modalidades (remoto, híbrido) para ampliar opções.',
      salary: 'Sua pretensão pode estar acima da média. Revise suas faixas salariais.',
    };
    return {
      weakest: score.weakest,
      value: score.weakest_value,
      suggestion: suggestions[score.weakest] ?? '',
    };
  }

  // =============================================
  // DEV — Skills (JSON)
  // =============================================

  async getSkillsGap(devProfileId: string): Promise<any[]> {
    const key = KEY.devSkillsGap(devProfileId);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const rows = await this.devSkillRepo.query(`
      SELECT st.id, st.name, st.category, COUNT(*) as demand
      FROM job_skills js
      JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
      JOIN skill_tree st ON st.id = js.skill_id
      WHERE js.skill_id NOT IN (SELECT skill_id FROM dev_skills WHERE dev_profile_id = $1)
      GROUP BY st.id, st.name, st.category
      ORDER BY demand DESC
      LIMIT 5
    `, [devProfileId]);

    const result = rows.map((r: any) => ({ ...r, demand: num(r.demand) }));
    await this.setJson(key, result, TTL.DEV_SKILLS);
    return result;
  }

  async getSkillsPopularity(devProfileId: string): Promise<any[]> {
    const key = KEY.devSkillsTop(devProfileId);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const totalJobs = await this.jobRepo.count({ where: { status: 'open' } });
    if (totalJobs === 0) return [];

    const rows = await this.devSkillRepo.query(`
      SELECT st.id, st.name, st.category, ds.level,
        COUNT(js.id) as job_demand,
        ROUND(COUNT(js.id) * 100.0 / $2, 1) as popularity_pct
      FROM dev_skills ds
      JOIN skill_tree st ON st.id = ds.skill_id
      LEFT JOIN job_skills js ON js.skill_id = ds.skill_id
      LEFT JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
      WHERE ds.dev_profile_id = $1
      GROUP BY st.id, st.name, st.category, ds.level
      ORDER BY popularity_pct DESC
    `, [devProfileId, totalJobs]);

    const result = rows.map((r: any) => ({ ...r, job_demand: num(r.job_demand), popularity_pct: num(r.popularity_pct) }));
    await this.setJson(key, result, TTL.DEV_SKILLS);
    return result;
  }

  /**
   * Tabela completa das skills do dev no mercado.
   * Para cada skill que o dev possui:
   *  - total_jobs: quantas vagas abertas pedem essa skill
   *  - market_avg_level: nivel medio exigido pelas vagas
   *  - jobs_dev_can_meet: quantas dessas vagas exigem nivel <= nivel do dev
   *  - dev_can_meet_pct: jobs_dev_can_meet / total_jobs * 100
   * Ordem: total_jobs DESC.
   */
  async getMySkillsMarketTable(devProfileId: string): Promise<any[]> {
    const key = KEY.devSkillsMarketTable(devProfileId);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const rows = await this.devSkillRepo.query(`
      WITH last_month_demand AS (
        SELECT js.skill_id, COUNT(*) AS d
        FROM job_skills js
        JOIN jobs j ON j.id = js.job_id
        WHERE j.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY js.skill_id
      ),
      prev_month_demand AS (
        SELECT js.skill_id, COUNT(*) AS d
        FROM job_skills js
        JOIN jobs j ON j.id = js.job_id
        WHERE j.created_at >= NOW() - INTERVAL '60 days'
          AND j.created_at <  NOW() - INTERVAL '30 days'
        GROUP BY js.skill_id
      ),
      ranked_last AS (
        SELECT skill_id, d AS demand_last,
          ROW_NUMBER() OVER (ORDER BY d DESC) AS position
        FROM last_month_demand
      )
      SELECT
        st.id, st.name, st.category,
        ds.level AS my_level,
        CASE ds.level
          WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END AS my_level_num,
        COUNT(j.id) AS total_jobs,
        COUNT(j.id) FILTER (
          WHERE CASE js.min_level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END
          <= CASE ds.level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END
        ) AS jobs_dev_can_meet,
        COALESCE(ROUND(AVG(CASE js.min_level
          WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END)::numeric, 1), 0) AS market_avg_level,
        rl.position AS month_position,
        COALESCE(rl.demand_last, 0) AS demand_last_month,
        COALESCE(p.d, 0) AS demand_prev_month
      FROM dev_skills ds
      JOIN skill_tree st ON st.id = ds.skill_id
      LEFT JOIN job_skills js ON js.skill_id = ds.skill_id
      LEFT JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
      LEFT JOIN ranked_last rl ON rl.skill_id = ds.skill_id
      LEFT JOIN prev_month_demand p ON p.skill_id = ds.skill_id
      WHERE ds.dev_profile_id = $1
      GROUP BY st.id, st.name, st.category, ds.level, rl.position, rl.demand_last, p.d
      ORDER BY rl.position ASC NULLS LAST, total_jobs DESC, st.name ASC
    `, [devProfileId]);

    const result = rows.map((r: any) => {
      const total = num(r.total_jobs);
      const canMeet = num(r.jobs_dev_can_meet);
      const marketAvg = num(r.market_avg_level);
      const demandLast = num(r.demand_last_month);
      const demandPrev = num(r.demand_prev_month);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (demandLast > demandPrev) trend = 'up';
      else if (demandLast < demandPrev) trend = 'down';

      return {
        skill_id: r.id,
        name: r.name,
        category: r.category,
        my_level: r.my_level,
        my_level_num: num(r.my_level_num),
        total_jobs: total,
        market_avg_level: marketAvg,
        market_avg_label: levelLabel(marketAvg),
        jobs_dev_can_meet: canMeet,
        dev_can_meet_pct: total > 0 ? Math.round((canMeet / total) * 100) : 0,
        month_position: r.month_position != null ? num(r.month_position) : null,
        demand_last_month: demandLast,
        demand_prev_month: demandPrev,
        trend,
      };
    });

    await this.setJson(key, result, TTL.DEV_SKILLS);
    return result;
  }

  async getMySkillsInsights(devProfileId: string): Promise<any> {
    const diffKey = KEY.devSkillsDifferentials(devProfileId);
    const improveKey = KEY.devSkillsToImprove(devProfileId);
    const gapKey = KEY.devSkillsGap(devProfileId);

    // Try cached pieces
    const [cachedDiff, cachedImprove, cachedGap] = await Promise.all([
      this.getJson<any[]>(diffKey),
      this.getJson<any[]>(improveKey),
      this.getJson<any[]>(gapKey),
    ]);

    if (cachedDiff !== null && cachedImprove !== null && cachedGap !== null) {
      return {
        my_required_analysis: [...cachedDiff, ...cachedImprove],
        my_required_gap: cachedGap,
      };
    }

    // Compute
    const analysis = await this.devSkillRepo.query(`
      WITH dev_levels AS (
        SELECT skill_id,
          AVG(CASE level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END) as dev_avg
        FROM dev_skills GROUP BY skill_id
      ),
      required_top AS (
        SELECT
          st.id as skill_id, st.name, st.category, COUNT(*) as demand,
          ROUND(AVG(CASE js.min_level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END)::numeric, 1) as market_avg_level
        FROM job_skills js
        JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
        JOIN skill_tree st ON st.id = js.skill_id
        WHERE js.requirement = 'required'
        GROUP BY st.id, st.name, st.category
      ),
      my_skills AS (
        SELECT skill_id, level,
          CASE level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END as my_level_num
        FROM dev_skills WHERE dev_profile_id = $1
      )
      SELECT
        rt.skill_id, rt.name, rt.category, rt.demand, rt.market_avg_level,
        ROUND(COALESCE(dl.dev_avg, 0)::numeric, 1) as dev_avg_level,
        ms.level as my_level, ms.my_level_num
      FROM required_top rt
      LEFT JOIN dev_levels dl ON dl.skill_id = rt.skill_id
      INNER JOIN my_skills ms ON ms.skill_id = rt.skill_id
      ORDER BY rt.demand DESC
      LIMIT 15
    `, [devProfileId]);

    const myAnalysis = analysis.map((row: any) => {
      const myLevel = num(row.my_level_num);
      const marketAvg = num(row.market_avg_level);
      const devAvg = num(row.dev_avg_level);
      const aboveMarket = myLevel > marketAvg;
      const aboveDevAvg = myLevel > devAvg;
      return {
        skill_id: row.skill_id, name: row.name, category: row.category,
        demand: num(row.demand),
        market_avg_level: marketAvg, market_avg_label: levelLabel(marketAvg),
        dev_avg_level: devAvg, dev_avg_label: levelLabel(devAvg),
        my_level: row.my_level, my_level_num: myLevel,
        above_market: aboveMarket, above_dev_avg: aboveDevAvg,
        is_differential: aboveMarket && aboveDevAvg,
      };
    });

    const differentials = myAnalysis.filter((s: any) => s.is_differential);
    const toImprove = myAnalysis.filter((s: any) => !s.above_market);
    const gap = await this.getSkillsGap(devProfileId);

    // Persist
    await Promise.all([
      this.setJson(diffKey, differentials, TTL.DEV_SKILLS),
      this.setJson(improveKey, toImprove, TTL.DEV_SKILLS),
    ]);

    return { my_required_analysis: myAnalysis, my_required_gap: gap };
  }

  /**
   * Maiores gaps das melhores vagas do dev (top matches).
   * Considera apenas vagas com score >= 60 (top 50) e elenca as skills mais
   * pedidas onde o dev:
   *  - NAO tem (gap forte)
   *  - tem com nivel abaixo do exigido (gap medio)
   */
  async getTopMatchesGaps(devProfileId: string): Promise<any[]> {
    const key = KEY.devSkillsTopMatchesGaps(devProfileId);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const rows = await this.matchRepo.query(`
      WITH best_matches AS (
        SELECT job_id, score
        FROM match_scores
        WHERE dev_profile_id = $1 AND score >= 60
        ORDER BY score DESC
        LIMIT 50
      ),
      job_skills_in_best AS (
        SELECT
          js.skill_id,
          bm.score AS job_score,
          CASE js.min_level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END AS min_level_num
        FROM best_matches bm
        JOIN job_skills js ON js.job_id = bm.job_id
      ),
      my_skills_map AS (
        SELECT skill_id,
          CASE level
            WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
            WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END AS my_level_num,
          level AS my_level
        FROM dev_skills WHERE dev_profile_id = $1
      ),
      grouped AS (
        SELECT
          jb.skill_id,
          COUNT(*) AS appearances,
          ROUND(AVG(jb.min_level_num)::numeric, 1) AS avg_required_level,
          MAX(jb.job_score) AS best_match_score,
          ms.my_level,
          ms.my_level_num
        FROM job_skills_in_best jb
        LEFT JOIN my_skills_map ms ON ms.skill_id = jb.skill_id
        GROUP BY jb.skill_id, ms.my_level, ms.my_level_num
      )
      SELECT
        g.skill_id, st.name, st.category,
        g.appearances, g.avg_required_level, g.best_match_score,
        g.my_level, g.my_level_num
      FROM grouped g
      JOIN skill_tree st ON st.id = g.skill_id
      WHERE g.my_level_num IS NULL OR g.my_level_num < g.avg_required_level
      ORDER BY
        CASE WHEN g.my_level_num IS NULL THEN 0 ELSE 1 END,  -- gap forte primeiro
        g.appearances DESC,
        g.best_match_score DESC
      LIMIT 10
    `, [devProfileId]);

    const result = rows.map((r: any) => {
      const myLevel = r.my_level_num != null ? num(r.my_level_num) : null;
      const reqAvg = num(r.avg_required_level);
      return {
        skill_id: r.skill_id,
        name: r.name,
        category: r.category,
        appearances: num(r.appearances),
        avg_required_level: reqAvg,
        required_label: levelLabel(reqAvg),
        my_level: r.my_level ?? null,
        my_level_num: myLevel,
        gap_type: myLevel === null ? 'strong' : 'medium',
        best_match_score: num(r.best_match_score),
      };
    });

    await this.setJson(key, result, TTL.DEV_SKILLS);
    return result;
  }

  // =============================================
  // DEV — Top cities (JSON)
  // =============================================

  /**
   * Cidades com mais vagas presencial/hibrido entre as melhores vagas (score >= 60) do dev.
   * Retorna lista vazia se dev so aceita remoto ou nao tem matches relevantes.
   * Ordena por numero de vagas DESC, depois por score medio DESC.
   */
  async getTopCitiesForDev(devProfileId: string): Promise<{
    city_id: number;
    city_name: string;
    state_abbr: string;
    state_name: string;
    job_count: number;
    avg_score: number;
    avg_clt: number | null;
    avg_pj: number | null;
  }[]> {
    const profile = await this.devProfileRepo.findOne({
      where: { id: devProfileId },
      select: ['id', 'workModes'],
    });
    const modes = profile?.workModes ?? [];
    const acceptsPresencial = modes.includes('hybrid') || modes.includes('onsite');
    if (!acceptsPresencial) return [];

    const key = KEY.devTopCities(devProfileId);
    const cached = await this.getJson<any[]>(key);
    if (cached) return cached;

    const rows = await this.matchRepo.query(`
      SELECT
        c.id AS city_id,
        c.name AS city_name,
        st.abbr AS state_abbr,
        st.name AS state_name,
        COUNT(*) AS job_count,
        ROUND(AVG(ms.score)::numeric, 1) AS avg_score,
        ROUND(AVG(
          CASE WHEN j.salary_clt_min IS NOT NULL AND j.salary_clt_max IS NOT NULL
            THEN (j.salary_clt_min + j.salary_clt_max) / 2.0 END
        )::numeric, 0) AS avg_clt,
        ROUND(AVG(
          CASE WHEN j.salary_pj_min IS NOT NULL AND j.salary_pj_max IS NOT NULL
            THEN (j.salary_pj_min + j.salary_pj_max) / 2.0 END
        )::numeric, 0) AS avg_pj
      FROM match_scores ms
      JOIN jobs j ON j.id = ms.job_id AND j.status = 'open'
      JOIN cities c ON c.id = j.city_id
      JOIN states st ON st.id = c.state_id
      WHERE ms.dev_profile_id = $1
        AND ms.score >= 60
        AND j.work_mode IN ('hybrid', 'onsite')
        AND j.city_id IS NOT NULL
      GROUP BY c.id, c.name, st.abbr, st.name
      ORDER BY job_count DESC, avg_score DESC
      LIMIT 15
    `, [devProfileId]);

    const result = rows.map((r: any) => ({
      city_id: num(r.city_id),
      city_name: r.city_name,
      state_abbr: r.state_abbr,
      state_name: r.state_name,
      job_count: num(r.job_count),
      avg_score: num(r.avg_score),
      avg_clt: r.avg_clt != null ? num(r.avg_clt) : null,
      avg_pj: r.avg_pj != null ? num(r.avg_pj) : null,
    }));

    await this.setJson(key, result, TTL.DEV_SCORE);
    return result;
  }

  // =============================================
  // DEV — Applications (HASH)
  // =============================================

  async getApplicationsSummary(devProfileId: string): Promise<{
    total: number; pending: number; accepted: number; rejected: number; withdrawn: number;
    acceptance_rate: number;
  }> {
    const key = KEY.devApplications(devProfileId);
    const cached = await this.getHash(key);
    if (cached) {
      return {
        total: num(cached.total), pending: num(cached.pending),
        accepted: num(cached.accepted), rejected: num(cached.rejected),
        withdrawn: num(cached.withdrawn), acceptance_rate: num(cached.acceptance_rate),
      };
    }

    const rows = await this.appRepo.query(`
      SELECT status, COUNT(*) as count FROM job_applications
      WHERE dev_profile_id = $1 GROUP BY status
    `, [devProfileId]);

    const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    let total = 0;
    for (const r of rows) {
      counts[r.status] = num(r.count);
      total += num(r.count);
    }
    const denom = counts.accepted + counts.rejected;
    const acceptance_rate = denom > 0 ? Math.round((counts.accepted / denom) * 100) : 0;

    const result = { total, ...counts, acceptance_rate };
    await this.setHash(key, result, TTL.DEV_APPLICATIONS);
    return result as any;
  }

  // =============================================
  // DEV — Profile (HASH + JSON sections)
  // =============================================

  async getProfileCompleteness(devProfileId: string): Promise<any> {
    const key = KEY.devProfileCompleteness(devProfileId);
    const sectionsKey = KEY.devProfileCompletenessSections(devProfileId);

    const [cachedHash, cachedSections] = await Promise.all([
      this.getHash(key),
      this.getJson<any[]>(sectionsKey),
    ]);

    if (cachedHash && cachedSections) {
      const missing = cachedSections.filter((s) => !s.done).map((s) => s.label);
      return { score: num(cachedHash.score), missing, sections: cachedSections };
    }

    const profile = await this.devProfileRepo.findOne({ where: { id: devProfileId } });
    if (!profile) return { score: 0, missing: [], sections: [] };

    const skillCount = await this.devSkillRepo.count({ where: { devProfileId } });
    const expCount = await this.devProfileRepo.query(`SELECT COUNT(*) as c FROM experiences WHERE dev_profile_id = $1`, [devProfileId]);
    const eduCount = await this.devProfileRepo.query(`SELECT COUNT(*) as c FROM educations WHERE dev_profile_id = $1`, [devProfileId]);
    const projectCount = await this.devProfileRepo.query(`SELECT COUNT(*) as c FROM projects WHERE dev_profile_id = $1`, [devProfileId]);

    const sections = [
      { name: 'bio', label: 'Bio, título e avatar', weight: 10, done: !!profile.bio && !!profile.title },
      { name: 'skills', label: 'Skills (mínimo 5)', weight: 20, done: skillCount >= 5 },
      { name: 'experience', label: 'Experiência profissional', weight: 20, done: num(expCount[0]?.c) > 0 },
      { name: 'education', label: 'Formação acadêmica', weight: 10, done: num(eduCount[0]?.c) > 0 },
      { name: 'projects', label: 'Projetos', weight: 10, done: num(projectCount[0]?.c) > 0 },
      { name: 'salary', label: 'Pretensão salarial (CLT ou PJ)', weight: 15, done: profile.salaryCltMin != null || profile.salaryPjMin != null },
      { name: 'location', label: 'Localização (cidade)', weight: 10, done: profile.cityId != null },
      { name: 'links', label: 'Links externos', weight: 5, done: (profile.links?.length ?? 0) > 0 },
    ];

    let score = 0;
    const missing: string[] = [];
    for (const s of sections) {
      if (s.done) score += s.weight;
      else missing.push(s.label);
    }

    await Promise.all([
      this.setHash(key, { score, missing_count: missing.length }, TTL.DEV_PROFILE),
      this.setJson(sectionsKey, sections, TTL.DEV_PROFILE),
    ]);

    return { score, missing, sections };
  }

  /**
   * Retorna mapa skill_id → { level, level_num } das skills que o dev possui (filtrado por skillIds).
   * Usado para enriquecer rankings globais com info pessoal.
   */
  async getDevLevelsForSkills(devProfileId: string, skillIds: string[]): Promise<Map<string, { level: string; level_num: number }>> {
    const map = new Map<string, { level: string; level_num: number }>();
    if (skillIds.length === 0) return map;

    const rows = await this.devSkillRepo.query(`
      SELECT skill_id, level,
        CASE level
          WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END as level_num
      FROM dev_skills
      WHERE dev_profile_id = $1 AND skill_id = ANY($2)
    `, [devProfileId, skillIds]);

    for (const r of rows) {
      map.set(r.skill_id, { level: r.level, level_num: num(r.level_num) });
    }
    return map;
  }

  // =============================================
  // Cache invalidation helpers
  // =============================================

  async invalidateDev(devProfileId: string): Promise<void> {
    const keys = await this.redis.keys(`indicator:dev:${devProfileId}:*`);
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async invalidateGlobalSkill(skillId: string): Promise<void> {
    await this.redis.del(KEY.globalSkillDevs(skillId), KEY.globalSkillJobs(skillId));
  }
}
