import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import {
  DevIndicatorService,
  ScoreAvgBySeniority,
  ScoreWeakest,
  ApplicationsSummary,
} from '../../../../../core/services/dev-indicator.service';

@Component({
  selector: 'app-jobs-tab',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './jobs-tab.component.html',
  styleUrl: './jobs-tab.component.scss',
})
export class JobsTabComponent implements OnInit {
  private readonly indicatorService = inject(DevIndicatorService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  scoreBySeniority = signal<ScoreAvgBySeniority[]>([]);
  selectedSeniority = signal<string | null>(null);
  scoreWeakest = signal<ScoreWeakest | null>(null);
  applicationsSummary = signal<ApplicationsSummary | null>(null);

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
    return this.seniorityOrder.filter((s) => map.has(s)).map((s) => map.get(s)!);
  });

  selectedScore = computed(() => {
    const sel = this.selectedSeniority();
    if (!sel) return null;
    return this.scoreBySeniority().find((s) => s.seniority === sel) ?? null;
  });

  acceptanceRate = computed(() => {
    const s = this.applicationsSummary();
    if (!s) return 0;
    const denom = s.accepted + s.rejected;
    return denom > 0 ? Math.round((s.accepted / denom) * 100) : 0;
  });

  ngOnInit(): void {
    this.indicatorService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const scores = data.personal.score_avg_by_seniority ?? [];
          this.scoreBySeniority.set(scores);
          if (scores.length > 0) {
            const best = scores.reduce((max, s) => Number(s.general) > Number(max.general) ? s : max, scores[0]);
            this.selectedSeniority.set(best.seniority);
          }
          this.scoreWeakest.set(data.personal.score_weakest);
          this.applicationsSummary.set(data.personal.applications_summary);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
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
}
