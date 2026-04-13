import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { JobService } from '../../../core/services/job.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-company-jobs',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss',
})
export class CompanyJobsComponent implements OnInit {
  private readonly jobService = inject(JobService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  jobs = signal<Job[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadJobs();
  }

  toggleStatus(job: Job): void {
    const obs = job.status === 'open'
      ? this.jobService.close(job.id)
      : this.jobService.reopen(job.id);

    obs.subscribe({
      next: () => {
        this.notify.success(job.status === 'open' ? 'Rota fechada.' : 'Rota reaberta.');
        this.loadJobs();
      },
      error: (err: ApiError) => this.notify.error(extractErrorMessage(err)),
    });
  }

  removeJob(job: Job): void {
    this.jobService.remove(job.id).subscribe({
      next: () => {
        this.notify.success('Rota removida.');
        this.loadJobs();
      },
      error: (err: ApiError) => this.notify.error(extractErrorMessage(err)),
    });
  }

  seniorityLabel(value: string): string {
    const map: Record<string, string> = {
      intern: 'Estágio', junior: 'Júnior', mid: 'Pleno',
      senior: 'Sênior', lead: 'Lead', specialist: 'Especialista',
    };
    return map[value] ?? value;
  }

  workModeLabel(value: string): string {
    const map: Record<string, string> = {
      remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial',
    };
    return map[value] ?? value;
  }

  contractLabel(value: string): string {
    const map: Record<string, string> = {
      clt: 'CLT', pj: 'PJ', clt_pj: 'CLT/PJ',
    };
    return map[value] ?? value;
  }

  formatCurrency(value: number): string {
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private loadJobs(): void {
    this.isLoading.set(true);
    this.jobService.getMyJobs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jobs) => {
          this.jobs.set(jobs);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
