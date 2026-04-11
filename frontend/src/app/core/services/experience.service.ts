import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Experience, CreateExperiencePayload, UpdateExperiencePayload } from '../models/experience.model';

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private readonly api = inject(ApiService);

  getMyExperiences(): Observable<Experience[]> {
    return this.api.get<{ data: Experience[] }>('/dev/experiences').pipe(
      map((res) => res.data),
    );
  }

  addExperience(payload: CreateExperiencePayload): Observable<Experience> {
    return this.api.post<{ data: Experience }>('/dev/experiences', payload).pipe(
      map((res) => res.data),
    );
  }

  updateExperience(id: string, payload: UpdateExperiencePayload): Observable<Experience> {
    return this.api.put<{ data: Experience }>(`/dev/experiences/${id}`, payload).pipe(
      map((res) => res.data),
    );
  }

  removeExperience(id: string): Observable<void> {
    return this.api.delete<void>(`/dev/experiences/${id}`);
  }
}
