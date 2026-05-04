import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import {
  JobService,
  CompanyJobRow,
  CompanyJobStatus,
  CompanyJobsSearchFilters,
} from '../../../core/services/job.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';

@Component({
  selector: 'app-company-jobs',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
})
export class CompanyJobsComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  rows = signal<CompanyJobRow[]>([]);
  isLoading = signal(false);

  // Filters
  filterStatus = signal<CompanyJobStatus | ''>('');
  filterQ = signal('');

  // Pagination
  currentPage = signal(1);
  totalItems = signal(0);
  lastPage = signal(1);
  readonly pageSize = 10;

  // Delete confirmation
  pendingDeleteId = signal<string | null>(null);

  pendingDelete = computed(() => {
    const id = this.pendingDeleteId();
    return id ? this.rows().find((r) => r.id === id) ?? null : null;
  });

  ngOnInit(): void {
    this.search();
  }

  search(resetPage = true): void {
    if (resetPage) this.currentPage.set(1);
    this.isLoading.set(true);

    const filters: CompanyJobsSearchFilters = {
      page: this.currentPage(),
      limit: this.pageSize,
    };
    if (this.filterStatus()) filters.status = this.filterStatus() as CompanyJobStatus;
    if (this.filterQ()) filters.q = this.filterQ();

    this.jobService.search(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.rows.set(result.data);
          this.totalItems.set(result.meta.total);
          this.lastPage.set(result.meta.last_page);
          this.currentPage.set(result.meta.current_page);
          this.isLoading.set(false);
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
    this.filterStatus.set('');
    this.filterQ.set('');
    this.search();
  }

  // ---------- Actions ----------

  view(job: CompanyJobRow): void {
    // Tela de visualizacao detalhada sera implementada depois
    this.router.navigate(['/company/jobs', job.id, 'view']);
  }

  edit(job: CompanyJobRow): void {
    this.router.navigate(['/company/jobs', job.id, 'edit']);
  }

  askDelete(job: CompanyJobRow): void {
    this.pendingDeleteId.set(job.id);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  confirmDelete(): void {
    const job = this.pendingDelete();
    if (!job) return;
    this.jobService.remove(job.id).subscribe({
      next: () => {
        this.notify.success('Vaga excluída.');
        this.pendingDeleteId.set(null);
        this.search(false);
      },
      error: (err: ApiError) => {
        this.notify.error(extractErrorMessage(err));
        this.pendingDeleteId.set(null);
      },
    });
  }

  // ---------- Helpers ----------

  truncate(text: string | null | undefined, max = 80): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
  }

  formatBRL(v: number | null | undefined): string {
    if (v == null) return '-';
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  closedAt(job: CompanyJobRow): string | null {
    return job.status === 'closed' ? job.updated_at : null;
  }

  statusLabel(s: string): string {
    return ({ open: 'Aberta', frozen: 'Congelada', closed: 'Finalizada' } as Record<string, string>)[s] ?? s;
  }

  seniorityLabel(value: string): string {
    return ({
      intern: 'Estágio', junior: 'Júnior', mid: 'Pleno',
      senior: 'Sênior', lead: 'Lead', specialist: 'Especialista',
    } as Record<string, string>)[value] ?? value;
  }

  workModeLabel(value: string): string {
    return ({ remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial' } as Record<string, string>)[value] ?? value;
  }

  contractLabel(value: string): string {
    return ({ clt: 'CLT', pj: 'PJ', clt_pj: 'CLT/PJ' } as Record<string, string>)[value] ?? value;
  }
}
