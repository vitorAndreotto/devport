import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface DevApplication {
  id: string;
  status: string;
  job_id?: string;
  job?: {
    id: string;
    title: string;
    seniority: string;
    work_mode: string;
    contract_model: string;
    city_id: number | null;
    status: string;
    company?: {
      company_name: string;
      logo_url: string | null;
    };
  };
  created_at: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class JobApplicationService {
  private readonly api = inject(ApiService);

  apply(jobId: string): Observable<DevApplication> {
    return this.api.post<{ data: DevApplication }>('/dev/applications', { job_id: jobId }).pipe(
      map((r) => r.data),
    );
  }

  getMyApplications(): Observable<DevApplication[]> {
    return this.api.get<{ data: DevApplication[] }>('/dev/applications').pipe(
      map((r) => r.data),
    );
  }

  withdraw(applicationId: string): Observable<void> {
    return this.api.patch<void>(`/dev/applications/${applicationId}/withdraw`);
  }
}
