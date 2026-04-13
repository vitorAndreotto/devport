import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { JobListItem, JobDetail } from '../models/job.model';

export interface PaginatedJobs {
  data: JobListItem[];
  meta: {
    current_page: number;
    limit: number;
    total: number;
    last_page: number;
  };
}

export interface SkillFilter {
  skill_id: string;
  min_level?: string;
}

export interface JobSearchFilters {
  q?: string;
  work_mode?: string;
  contract_model?: string;
  seniority?: string;
  city_id?: number;
  skills?: SkillFilter[];
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicJobService {
  private readonly api = inject(ApiService);

  search(filters: JobSearchFilters = {}): Observable<PaginatedJobs> {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.work_mode) params.set('work_mode', filters.work_mode);
    if (filters.contract_model) params.set('contract_model', filters.contract_model);
    if (filters.seniority) params.set('seniority', filters.seniority);
    if (filters.city_id) params.set('city_id', String(filters.city_id));
    if (filters.skills?.length) {
      const encoded = filters.skills.map((s) =>
        s.min_level ? `${s.skill_id}:${s.min_level}` : s.skill_id,
      ).join(',');
      params.set('skills', encoded);
    }
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const path = qs ? `/jobs?${qs}` : '/jobs';

    return this.api.get<{ data: PaginatedJobs }>(path).pipe(map((r) => r.data));
  }

  getById(id: string): Observable<JobDetail> {
    return this.api.get<{ data: JobDetail }>(`/jobs/${id}`).pipe(map((r) => r.data));
  }
}
