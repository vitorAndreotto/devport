import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { DevProfileService } from '../../../core/services/dev-profile.service';
import { SKILL_LEVEL_LABELS, SKILL_CATEGORIES } from '../../../core/models/skill.model';
import { SkillService } from '../../../core/services/skill.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { EducationService } from '../../../core/services/education.service';
import { ProjectService } from '../../../core/services/project.service';
import {
  DevIndicatorService,
  ScoreAvgBySeniority,
  ScoreWeakest,
  SkillGapRow,
  SkillPopRow,
  WorkModeRow,
  ApplicationsSummary,
  ProfileCompleteness,
  TopSkillRow,
  MyRequiredAnalysisRow,
  MyRequiredGapRow,
  TopSkillByRequirement,
} from '../../../core/services/dev-indicator.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly profileService = inject(DevProfileService);
  private readonly skillService = inject(SkillService);
  private readonly experienceService = inject(ExperienceService);
  private readonly educationService = inject(EducationService);
  private readonly projectService = inject(ProjectService);
  private readonly indicatorService = inject(DevIndicatorService);
  private readonly destroyRef = inject(DestroyRef);

  profileName = computed(() => this.profileService.currentProfile()?.full_name ?? '');
  skillCount = signal(0);
  experienceCount = signal(0);
  educationCount = signal(0);
  projectCount = signal(0);

  // Indicators
  loadingIndicators = signal(true);
  scoreBySeniority = signal<ScoreAvgBySeniority[]>([]);
  selectedSeniority = signal<string | null>(null);
  scoreWeakest = signal<ScoreWeakest | null>(null);
  skillsGap = signal<SkillGapRow[]>([]);
  skillsPopularity = signal<SkillPopRow[]>([]);
  workModeDistribution = signal<WorkModeRow[]>([]);
  topSkills = signal<TopSkillRow[]>([]);
  applicationsSummary = signal<ApplicationsSummary | null>(null);
  profileCompleteness = signal<ProfileCompleteness | null>(null);

  // Skills insights
  loadingSkillsInsights = signal(true);
  topByRequirement = signal<{ required: TopSkillByRequirement[]; expected: TopSkillByRequirement[]; differential: TopSkillByRequirement[] }>({
    required: [], expected: [], differential: [],
  });
  selectedRequirement = signal<'required' | 'expected' | 'differential'>('required');
  myRequiredAnalysis = signal<MyRequiredAnalysisRow[]>([]);
  myRequiredGap = signal<MyRequiredGapRow[]>([]);

  selectedTopSkills = computed(() => this.topByRequirement()[this.selectedRequirement()] ?? []);
  myDifferentials = computed(() => this.myRequiredAnalysis().filter((s) => s.is_differential));
  myToImprove = computed(() => this.myRequiredAnalysis().filter((s) => !s.above_market));

  readonly quickActions = [
    { path: '/dev/profile', label: 'Registro da Embarcação', icon: 'user', description: 'Atualize a identidade do seu navio' },
    { path: '/dev/skills', label: 'Equipamentos de Bordo', icon: 'compass', description: 'Gerencie suas ferramentas e tecnologias' },
    { path: '/dev/experiences', label: 'Diário de Bordo', icon: 'anchor', description: 'Registre os portos por onde ancorou' },
    { path: '/dev/education', label: 'Carta Náutica', icon: 'graduation-cap', description: 'Suas habilitações de navegação' },
    { path: '/dev/projects', label: 'Cargas do Porto', icon: 'folder-git-2', description: 'Projetos que você transportou' },
    { path: '/dev/jobs', label: 'Rotas Disponíveis', icon: 'compass', description: 'Navegue até as melhores oportunidades' },
  ];

  readonly seniorityOrder = ['intern', 'junior', 'mid', 'senior', 'lead', 'specialist'];

  readonly seniorityLabels: Record<string, string> = {
    intern: 'Estágio',
    junior: 'Júnior',
    mid: 'Pleno',
    senior: 'Sênior',
    lead: 'Lead',
    specialist: 'Especialista',
  };

  orderedScores = computed(() => {
    const scores = this.scoreBySeniority();
    const map = new Map(scores.map((s) => [s.seniority, s]));
    return this.seniorityOrder
      .filter((s) => map.has(s))
      .map((s) => map.get(s)!);
  });

  selectedScore = computed(() => {
    const sel = this.selectedSeniority();
    const list = this.scoreBySeniority();
    if (!sel || list.length === 0) return null;
    return list.find((s) => s.seniority === sel) ?? null;
  });

  readonly workModeLabels: Record<string, string> = {
    remote: 'Remoto',
    hybrid: 'Híbrido',
    onsite: 'Presencial',
  };

  readonly levelLabels: Record<number, string> = {
    1: 'Iniciante',
    2: 'Intermediário',
    3: 'Avançado',
    4: 'Especialista',
  };

  readonly skillLevelLabels = SKILL_LEVEL_LABELS;
  readonly categoryLabels = SKILL_CATEGORIES;

  ngOnInit(): void {
    this.skillService.getMySkills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((skills) => this.skillCount.set(skills.length));

    this.experienceService.getMyExperiences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((experiences) => this.experienceCount.set(experiences.length));

    this.educationService.getMyEducations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((educations) => this.educationCount.set(educations.length));

    this.projectService.getMyProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projects) => this.projectCount.set(projects.length));

    this.loadIndicators();
    this.loadSkillsInsights();
  }

  private loadSkillsInsights(): void {
    this.loadingSkillsInsights.set(true);
    this.indicatorService.getSkillsInsights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.topByRequirement.set(data.general.top_by_requirement);
          this.myRequiredAnalysis.set(data.personal.my_required_analysis);
          this.myRequiredGap.set(data.personal.my_required_gap);
          this.loadingSkillsInsights.set(false);
        },
        error: () => this.loadingSkillsInsights.set(false),
      });
  }

  selectRequirement(req: 'required' | 'expected' | 'differential'): void {
    this.selectedRequirement.set(req);
  }

  private loadIndicators(): void {
    this.loadingIndicators.set(true);
    this.indicatorService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const scores = data.personal.score_avg_by_seniority ?? [];
          this.scoreBySeniority.set(scores);
          // Select the seniority with the highest general score
          if (scores.length > 0) {
            const best = scores.reduce((max, s) => Number(s.general) > Number(max.general) ? s : max, scores[0]);
            this.selectedSeniority.set(best.seniority);
          }
          this.scoreWeakest.set(data.personal.score_weakest);
          this.skillsGap.set(data.personal.skills_gap);
          this.skillsPopularity.set(data.personal.skills_popularity?.slice(0, 8) ?? []);
          this.workModeDistribution.set(data.general.work_mode_distribution);
          this.topSkills.set(data.general.top_skills?.slice(0, 5) ?? []);
          this.applicationsSummary.set(data.personal.applications_summary);
          this.profileCompleteness.set(data.personal.profile_completeness);
          this.loadingIndicators.set(false);
        },
        error: () => {
          this.loadingIndicators.set(false);
        },
      });
  }

  selectSeniority(seniority: string): void {
    this.selectedSeniority.set(seniority);
  }

  getScoreBarWidth(value: number | undefined): string {
    return `${Math.min(100, Math.max(0, Number(value) || 0))}%`;
  }

  getScoreColor(value: number | undefined): string {
    const v = Number(value) || 0;
    if (v >= 70) return 'var(--green-500, #22c55e)';
    if (v >= 40) return 'var(--amber-500, #f59e0b)';
    return 'var(--red-500, #ef4444)';
  }

  getLevelLabel(avg: number): string {
    return this.levelLabels[Math.round(avg)] ?? 'N/A';
  }

  getAcceptanceRate(): number {
    const s = this.applicationsSummary();
    if (!s) return 0;
    const denom = s.accepted + s.rejected;
    return denom > 0 ? Math.round((s.accepted / denom) * 100) : 0;
  }
}
