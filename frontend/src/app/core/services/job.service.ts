import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Job, CreateJobPayload, UpdateJobPayload } from '../models/job.model';

interface JobResponse {
  data: Job;
}

interface JobsResponse {
  data: Job[];
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = inject(ApiService);

  getMyJobs(): Observable<Job[]> {
    return this.api.get<JobsResponse>('/company/jobs').pipe(map((r) => r.data));
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
