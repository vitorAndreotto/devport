import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';
import { DevIndicatorService } from './dev-indicator.service.js';

@Controller('dev/indicators')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class DevIndicatorController {
  constructor(
    private readonly indicatorService: DevIndicatorService,
    private readonly profileService: DevProfileService,
  ) {}

  /** All indicators in one call — optimized for dashboard */
  @Get()
  async getDashboard(@CurrentUser() user: User) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const devId = profile.id;

    const [
      salaryAvg,
      topSkills,
      workModeDistribution,
      contractDistribution,
      seniorityDistribution,
      jobsMap,
      scoreAvg,
      scoreDistribution,
      scoreWeakest,
      skillsGap,
      skillsPopularity,
      applicationsSummary,
      profileCompleteness,
      topCities,
    ] = await Promise.all([
      this.indicatorService.getSalaryAvgBySeniority(),
      this.indicatorService.getTopSkills(),
      this.indicatorService.getWorkModeDistribution(),
      this.indicatorService.getContractDistribution(),
      this.indicatorService.getSeniorityDistribution(),
      this.indicatorService.getJobsMapByCity(),
      this.indicatorService.getScoreAvgBySeniority(devId),
      this.indicatorService.getScoreDistribution(devId),
      this.indicatorService.getScoreWeakest(devId),
      this.indicatorService.getSkillsGap(devId),
      this.indicatorService.getSkillsPopularity(devId),
      this.indicatorService.getApplicationsSummary(devId),
      this.indicatorService.getProfileCompleteness(devId),
      this.indicatorService.getTopCitiesForDev(devId),
    ]);

    return {
      general: {
        salary_avg_by_seniority: salaryAvg,
        top_skills: topSkills,
        work_mode_distribution: workModeDistribution,
        contract_distribution: contractDistribution,
        seniority_distribution: seniorityDistribution,
        jobs_map: jobsMap,
      },
      personal: {
        score_avg_by_seniority: scoreAvg,
        score_distribution: scoreDistribution,
        score_weakest: scoreWeakest,
        skills_gap: skillsGap,
        skills_popularity: skillsPopularity,
        applications_summary: applicationsSummary,
        profile_completeness: profileCompleteness,
        top_cities: topCities,
      },
    };
  }

  /** Skills insights — top by requirement + my required analysis + gap + top matches gaps */
  @Get('skills')
  async getSkillsInsights(@CurrentUser() user: User) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);

    const [topByRequirement, mySkillsInsights, topMatchesGaps, mySkillsMarketTable] = await Promise.all([
      this.indicatorService.getSkillsTopByRequirement(),
      this.indicatorService.getMySkillsInsights(profile.id),
      this.indicatorService.getTopMatchesGaps(profile.id),
      this.indicatorService.getMySkillsMarketTable(profile.id),
    ]);

    // Enriquecer top_by_requirement com my_level/my_level_num do dev
    const allIds = new Set<string>();
    for (const kind of ['required', 'expected', 'differential'] as const) {
      for (const item of topByRequirement[kind] ?? []) allIds.add(item.skill_id);
    }
    const myLevels = await this.indicatorService.getDevLevelsForSkills(profile.id, [...allIds]);

    const enriched: Record<string, any[]> = {};
    for (const kind of ['required', 'expected', 'differential'] as const) {
      enriched[kind] = (topByRequirement[kind] ?? []).map((item) => {
        const my = myLevels.get(item.skill_id);
        return {
          ...item,
          my_level: my?.level ?? null,
          my_level_num: my?.level_num ?? null,
        };
      });
    }

    return {
      general: {
        top_by_requirement: enriched,
      },
      personal: {
        ...mySkillsInsights,
        top_matches_gaps: topMatchesGaps,
        my_skills_market_table: mySkillsMarketTable,
      },
    };
  }
}
