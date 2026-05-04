import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Job, CreateJobPayload, UpdateJobPayload } from '../models/job.model';

interface JobResponse {
  data: Job;
}

export type CompanyJobStatus = 'open' | 'frozen' | 'closed';

export interface CompanyJobRow extends Job {
  application_count: number;
  applicants_avg_score: number | null;
  top_devs_avg_score: number | null;
}

export interface CompanyJobsSearchFilters {
  status?: CompanyJobStatus;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCompanyJobs {
  data: CompanyJobRow[];
  meta: { current_page: number; limit: number; total: number; last_page: number };
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = inject(ApiService);

  search(filters: CompanyJobsSearchFilters = {}): Observable<PaginatedCompanyJobs> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.q) params.set('q', filters.q);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    const path = qs ? `/company/jobs?${qs}` : '/company/jobs';
    return this.api.get<{ data: PaginatedCompanyJobs }>(path).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<Job> {
    return this.api.get<JobResponse>(`/company/jobs/${id}`).pipe(map((r) => r.data));
  }

  create(payload: CreateJobPayload): Observable<Job> {
    return this.api.post<JobResponse>('/company/jobs', payload).pipe(map((r) => r.data));
  }

  update(id: string, payload: UpdateJobPayload): Observable<Job> {
    return this.api.put<JobResponse>(`/company/jobs/${id}`, payload).pipe(map((r) => r.data));
  }

  close(id: string): Observable<void> {
    return this.api.patch<void>(`/company/jobs/${id}/close`);
  }

  reopen(id: string): Observable<void> {
    return this.api.patch<void>(`/company/jobs/${id}/reopen`);
  }

  remove(id: string): Observable<void> {
    return this.api.delete(`/company/jobs/${id}`);
  }
}
