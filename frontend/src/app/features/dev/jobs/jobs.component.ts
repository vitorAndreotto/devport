import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { PublicJobService, JobSearchFilters, SkillFilter } from '../../../core/services/public-job.service';
import { JobApplicationService, DevApplication } from '../../../core/services/job-application.service';
import { SkillService } from '../../../core/services/skill.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { LocationService } from '../../../core/services/location.service';
import { JobListItem, JobDetail } from '../../../core/models/job.model';
import { SkillTree } from '../../../core/models/skill.model';

@Component({
  selector: 'app-dev-jobs',
  standalone: true,
  imports: [FormsModule, DecimalPipe, LucideAngularModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
})
export class DevJobsComponent implements OnInit {
  private readonly jobService = inject(PublicJobService);
  private readonly appService = inject(JobApplicationService);
  private readonly skillService = inject(SkillService);
  private readonly locationService = inject(LocationService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  jobs = signal<JobListItem[]>([]);
  selectedJob = signal<JobDetail | null>(null);
  selectedJobId = signal<string | null>(null);
  isLoadingDetail = signal(false);
  applications = signal<Map<string, DevApplication>>(new Map());
  skills = signal<SkillTree[]>([]);
  isLoading = signal(false);
  isApplying = signal(false);

  // Pagination
  currentPage = signal(1);
  totalItems = signal(0);
  lastPage = signal(1);
  readonly pageSize = 15;

  // Filters
  filterQ = signal('');
  filterWorkMode = signal('');
  filterContract = signal('');
  filterSeniority = signal('');
  filterSkills = signal<SkillFilter[]>([]);
  filterNewSkillId = signal('');
  filterNewSkillLevel = signal('');
  skillSearchQuery = signal('');
  skillDropdownOpen = signal(false);
  filterCityId = signal<number | null>(null);
  filterCityName = signal('');
  citySearchQuery = signal('');
  cityDropdownOpen = signal(false);
  cityOptions = signal<{ id: number; name: string; state_abbr: string }[]>([]);
  filterApplication = signal(''); // 'applied' | 'not_applied' | ''

  showCityFilter = computed(() => {
    const mode = this.filterWorkMode();
    return mode === 'onsite' || mode === 'hybrid';
  });

  filteredSkillOptions = computed(() => {
    const query = this.skillSearchQuery().toLowerCase();
    const alreadySelected = new Set(this.filterSkills().map((s) => s.skill_id));
    let list = this.skills().filter((s) => !alreadySelected.has(s.id));
    if (query) {
      list = list.filter((s) => s.name.toLowerCase().includes(query));
    }
    return list.slice(0, 20);
  });

  filteredJobs = computed<JobListItem[]>(() => {
    let list = this.jobs();
    const appFilter = this.filterApplication();

    if (appFilter) {
      const appMap = this.applications();
      list = appFilter === 'applied'
        ? list.filter((j) => appMap.has(j.id))
        : list.filter((j) => !appMap.has(j.id));
    }

    return [...list].sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1));
  });

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterQ()) count++;
    if (this.filterWorkMode()) count++;
    if (this.filterContract()) count++;
    if (this.filterSeniority()) count++;
    count += this.filterSkills().length;
    if (this.filterCityId()) count++;
    if (this.filterApplication()) count++;
    return count;
  });

  ngOnInit(): void {
    this.loadSkills();
    this.loadApplications();
    this.search();
  }

  search(resetPage = true): void {
    if (resetPage) this.currentPage.set(1);
    this.isLoading.set(true);

    const filters: JobSearchFilters = {
      page: this.currentPage(),
      limit: this.pageSize,
    };
    if (this.filterQ()) filters.q = this.filterQ();
    if (this.filterWorkMode()) filters.work_mode = this.filterWorkMode();
    if (this.filterContract()) filters.contract_model = this.filterContract();
    if (this.filterSeniority()) filters.seniority = this.filterSeniority();
    if (this.filterSkills().length) filters.skills = this.filterSkills();
    if (this.filterCityId()) filters.city_id = this.filterCityId()!;

    this.jobService.search(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.jobs.set(result.data);
          this.totalItems.set(result.meta.total);
          this.lastPage.set(result.meta.last_page);
          this.currentPage.set(result.meta.current_page);
          this.isLoading.set(false);

          const visible = this.filteredJobs();
          if (visible.length > 0) {
            this.selectJob(visible[0]);
          } else {
            this.selectedJob.set(null);
          }
        },
        error: () => this.isLoading.set(false),
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.search(false);
  }

  clearFilters(): void {
    this.filterQ.set('');
    this.filterWorkMode.set('');
    this.filterContract.set('');
    this.filterSeniority.set('');
    this.filterSkills.set([]);
    this.filterNewSkillId.set('');
    this.filterNewSkillLevel.set('');
    this.skillSearchQuery.set('');
    this.filterCityId.set(null);
    this.filterCityName.set('');
    this.citySearchQuery.set('');
    this.cityOptions.set([]);
    this.filterApplication.set('');
    this.search();
  }

  onWorkModeChange(): void {
    if (!this.showCityFilter()) {
      this.filterCityId.set(null);
      this.filterCityName.set('');
      this.citySearchQuery.set('');
      this.cityOptions.set([]);
    }
    this.search();
  }

  onCitySearchInput(query: string): void {
    this.citySearchQuery.set(query);
    this.filterCityId.set(null);
    this.filterCityName.set('');

    if (query.length < 2) {
      this.cityOptions.set([]);
      return;
    }

    this.locationService.searchCities(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cities) => {
        const opts = cities.map((c) => ({
          id: c.id,
          name: c.name,
          state_abbr: (c as any).state?.abbr ?? '',
        }));
        this.cityOptions.set(opts);
        this.cityDropdownOpen.set(opts.length > 0);
      });
  }

  selectCity(city: { id: number; name: string; state_abbr: string }): void {
    this.filterCityId.set(city.id);
    this.filterCityName.set(`${city.name} - ${city.state_abbr}`);
    this.citySearchQuery.set(`${city.name} - ${city.state_abbr}`);
    this.cityDropdownOpen.set(false);
    this.cityOptions.set([]);
    this.search();
  }

  onCitySearchFocus(): void {
    if (this.cityOptions().length > 0) {
      this.cityDropdownOpen.set(true);
    }
  }

  onCitySearchBlur(): void {
    setTimeout(() => this.cityDropdownOpen.set(false), 200);
  }

  clearCity(): void {
    this.filterCityId.set(null);
    this.filterCityName.set('');
    this.citySearchQuery.set('');
    this.cityOptions.set([]);
    this.search();
  }

  selectJob(job: JobListItem): void {
    if (this.selectedJobId() === job.id) return;
    this.selectedJobId.set(job.id);
    this.isLoadingDetail.set(true);
    this.jobService.getById(job.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.selectedJob.set(detail);
          this.isLoadingDetail.set(false);
        },
        error: () => this.isLoadingDetail.set(false),
      });
  }

  getApplication(jobId: string): DevApplication | undefined {
    return this.applications().get(jobId);
  }

  apply(job: JobDetail): void {
    this.isApplying.set(true);
    this.appService.apply(job.id).subscribe({
      next: (app) => {
        this.isApplying.set(false);
        this.notify.success('Candidatura enviada!');
        this.applications.update((m) => {
          const copy = new Map(m);
          copy.set(job.id, app);
          return copy;
        });
      },
      error: (err: ApiError) => {
        this.isApplying.set(false);
        this.notify.error(extractErrorMessage(err));
      },
    });
  }

  withdraw(app: DevApplication): void {
    this.appService.withdraw(app.id).subscribe({
      next: () => {
        this.notify.success('Candidatura retirada.');
        this.applications.update((m) => {
          const copy = new Map(m);
          copy.delete(app.job_id ?? '');
          return copy;
        });
      },
      error: (err: ApiError) => this.notify.error(extractErrorMessage(err)),
    });
  }

  sortedSkills(skills: JobDetail['skills']): JobDetail['skills'] {
    const order: Record<string, number> = { required: 0, expected: 1, differential: 2 };
    return [...skills].sort((a, b) => (order[a.requirement] ?? 9) - (order[b.requirement] ?? 9));
  }

  timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return minutes <= 1 ? 'Agora' : `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}sem`;
    const months = Math.floor(days / 30);
    return `${months}m`;
  }

  selectSkillOption(skill: SkillTree): void {
    this.filterNewSkillId.set(skill.id);
    this.skillSearchQuery.set(skill.name);
    this.skillDropdownOpen.set(false);
  }

  onSkillSearchFocus(): void {
    this.skillDropdownOpen.set(true);
  }

  onSkillSearchBlur(): void {
    // Delay para permitir click no dropdown
    setTimeout(() => this.skillDropdownOpen.set(false), 200);
  }

  addSkillFilter(): void {
    const id = this.filterNewSkillId();
    if (!id) return;
    if (this.filterSkills().some((s) => s.skill_id === id)) return;

    const level = this.filterNewSkillLevel() || undefined;
    this.filterSkills.update((list) => [...list, { skill_id: id, min_level: level }]);
    this.filterNewSkillId.set('');
    this.filterNewSkillLevel.set('');
    this.skillSearchQuery.set('');
    this.search();
  }

  removeSkillFilter(index: number): void {
    this.filterSkills.update((list) => list.filter((_, i) => i !== index));
    this.search();
  }

  getSkillName(skillId: string): string {
    return this.skills().find((s) => s.id === skillId)?.name ?? skillId;
  }

  levelLabel(v: string): string {
    return ({ beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado', expert: 'Expert' } as Record<string, string>)[v] ?? v;
  }

  seniorityLabel(v: string): string {
    return ({ intern: 'Estágio', junior: 'Júnior', mid: 'Pleno', senior: 'Sênior', lead: 'Lead', specialist: 'Especialista' } as Record<string, string>)[v] ?? v;
  }

  workModeLabel(v: string): string {
    return ({ remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial' } as Record<string, string>)[v] ?? v;
  }

  contractLabel(v: string): string {
    return ({ clt: 'CLT', pj: 'PJ', clt_pj: 'CLT/PJ' } as Record<string, string>)[v] ?? v;
  }

  requirementLabel(v: string): string {
    return ({ required: 'Obrigatória', expected: 'Esperada', differential: 'Diferencial' } as Record<string, string>)[v] ?? v;
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private loadSkills(): void {
    this.skillService.getSkillTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tree) => {
        const flat: SkillTree[] = [];
        const flatten = (items: SkillTree[]) => {
          for (const s of items) {
            flat.push(s);
            if (s.children?.length) flatten(s.children);
          }
        };
        flatten(tree);
        this.skills.set(flat);
      });
  }

  private loadApplications(): void {
    this.appService.getMyApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((apps) => {
        const map = new Map<string, DevApplication>();
        for (const a of apps) {
          const jobId = a.job?.id ?? a.job_id;
          if (jobId) map.set(jobId, a);
        }
        this.applications.set(map);
      });
  }
}
