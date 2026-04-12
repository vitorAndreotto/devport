import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Education, CreateEducationPayload, UpdateEducationPayload } from '../models/education.model';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly api = inject(ApiService);

  getMyEducations(): Observable<Education[]> {
    return this.api.get<{ data: Education[] }>('/dev/educations').pipe(
      map((res) => res.data),
    );
  }

  addEducation(payload: CreateEducationPayload): Observable<Education> {
    return this.api.post<{ data: Education }>('/dev/educations', payload).pipe(
      map((res) => res.data),
    );
  }

  updateEducation(id: string, payload: UpdateEducationPayload): Observable<Education> {
    return this.api.put<{ data: Education }>(`/dev/educations/${id}`, payload).pipe(
      map((res) => res.data),
    );
  }

  removeEducation(id: string): Observable<void> {
    return this.api.delete<void>(`/dev/educations/${id}`);
  }
}
