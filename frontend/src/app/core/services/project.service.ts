import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);

  getMyProjects(): Observable<Project[]> {
    return this.api.get<{ data: Project[] }>('/dev/projects').pipe(
      map((res) => res.data),
    );
  }

  addProject(payload: CreateProjectPayload): Observable<Project> {
    return this.api.post<{ data: Project }>('/dev/projects', payload).pipe(
      map((res) => res.data),
    );
  }

  updateProject(id: string, payload: UpdateProjectPayload): Observable<Project> {
    return this.api.put<{ data: Project }>(`/dev/projects/${id}`, payload).pipe(
      map((res) => res.data),
    );
  }

  removeProject(id: string): Observable<void> {
    return this.api.delete<void>(`/dev/projects/${id}`);
  }
}
