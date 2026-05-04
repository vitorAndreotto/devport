import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import {
  DevIndicatorService,
  TopSkillByRequirement,
  MyRequiredAnalysisRow,
  MyRequiredGapRow,
  SkillGapRow,
  SkillPopRow,
  TopMatchesGapRow,
  MySkillsMarketTableRow,
} from '../../../../../core/services/dev-indicator.service';
import { SKILL_LEVEL_LABELS, SKILL_CATEGORIES } from '../../../../../core/models/skill.model';

type RequirementType = 'required' | 'expected' | 'differential';

@Component({
  selector: 'app-skills-tab',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './skills-tab.component.html',
  styleUrl: './skills-tab.component.scss',
})
export class SkillsTabComponent implements OnInit {
  private readonly indicatorService = inject(DevIndicatorService);
  private readonly destroyRef = inject(DestroyRef);

  loadingDashboard = signal(true);
  loadingSkills = signal(true);

  topByRequirement = signal<{ required: TopSkillByRequirement[]; expected: TopSkillByRequirement[]; differential: TopSkillByRequirement[] }>({
    required: [], expected: [], differential: [],
  });
  selectedRequirement = signal<RequirementType>('required');
  myRequiredAnalysis = signal<MyRequiredAnalysisRow[]>([]);
  myRequiredGap = signal<MyRequiredGapRow[]>([]);
  topMatchesGaps = signal<TopMatchesGapRow[]>([]);
  skillsGap = signal<SkillGapRow[]>([]);
  skillsPopularity = signal<SkillPopRow[]>([]);
  mySkillsMarketTable = signal<MySkillsMarketTableRow[]>([]);
  marketTablePage = signal(1);
  readonly MARKET_TABLE_PAGE_SIZE = 10;

  marketTableTotalPages = computed(() => {
    const total = this.mySkillsMarketTable().length;
    return Math.max(1, Math.ceil(total / this.MARKET_TABLE_PAGE_SIZE));
  });

  marketTablePageItems = computed(() => {
    const start = (this.marketTablePage() - 1) * this.MARKET_TABLE_PAGE_SIZE;
    return this.mySkillsMarketTable().slice(start, start + this.MARKET_TABLE_PAGE_SIZE);
  });

  readonly skillLevelLabels = SKILL_LEVEL_LABELS;
  readonly categoryLabels = SKILL_CATEGORIES;

  selectedTopSkills = computed(() => this.topByRequirement()[this.selectedRequirement()] ?? []);

  /** Demanda máxima entre as top skills da aba ativa, para barra relativa. */
  maxDemandInSelected = computed(() => {
    const list = this.selectedTopSkills();
    return list.length > 0 ? Math.max(...list.map((s) => s.demand)) : 0;
  });

  /** Contagem por requirement para mostrar nas pills. */
  reqCounts = computed(() => {
    const t = this.topByRequirement();
    return {
      required: t.required?.length ?? 0,
      expected: t.expected?.length ?? 0,
      differential: t.differential?.length ?? 0,
    };
  });

  demandPct(demand: number): number {
    const max = this.maxDemandInSelected();
    return max > 0 ? Math.round((demand / max) * 100) : 0;
  }

  formatDemand(d: number): string {
    if (d >= 1000) return `${(d / 1000).toFixed(1).replace('.0', '')}k`;
    return String(d);
  }
  myDifferentials = computed(() => this.myRequiredAnalysis().filter((s) => s.is_differential).slice(0, 5));
  topMatchesGapsTop = computed(() => this.topMatchesGaps().slice(0, 5));
  strongGapsCount = computed(() => this.topMatchesGaps().filter((g) => g.gap_type === 'strong').length);
  mediumGapsCount = computed(() => this.topMatchesGaps().filter((g) => g.gap_type === 'medium').length);

  /** Converte um nivel (1-4, pode ser fracionario) em % na regua (12.5% a 87.5%). */
  levelToPct(level: number | null | undefined): number {
    if (level == null) return 0;
    const v = Number(level) || 0;
    return Math.max(0, Math.min(100, ((v - 0.5) / 4) * 100));
  }

  ngOnInit(): void {
    this.indicatorService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.skillsGap.set(data.personal.skills_gap);
          this.skillsPopularity.set(data.personal.skills_popularity ?? []);
          this.loadingDashboard.set(false);
        },
        error: () => this.loadingDashboard.set(false),
      });

    this.indicatorService.getSkillsInsights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.topByRequirement.set(data.general.top_by_requirement);
          this.myRequiredAnalysis.set(data.personal.my_required_analysis);
          this.myRequiredGap.set(data.personal.my_required_gap);
          this.topMatchesGaps.set(data.personal.top_matches_gaps ?? []);
          this.mySkillsMarketTable.set(data.personal.my_skills_market_table ?? []);
          this.loadingSkills.set(false);
        },
        error: () => this.loadingSkills.set(false),
      });
  }

  selectRequirement(req: RequirementType): void {
    this.selectedRequirement.set(req);
  }

  goToPage(page: number): void {
    const max = this.marketTableTotalPages();
    this.marketTablePage.set(Math.max(1, Math.min(max, page)));
  }

  prevPage(): void { this.goToPage(this.marketTablePage() - 1); }
  nextPage(): void { this.goToPage(this.marketTablePage() + 1); }

  loading = computed(() => this.loadingDashboard() || this.loadingSkills());
}
