import { Injectable, inject } from '@angular/core';
import { Observable, map, tap, of } from 'rxjs';
import { ApiService } from '../api/api.service';
import { SkillTree, DevSkill, CreateDevSkillPayload, UpdateDevSkillPayload } from '../models/skill.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private readonly api = inject(ApiService);

  private cachedTree: SkillTree[] | null = null;
  private cachedCategories: string[] | null = null;

  // Skill Tree (público, com cache).
  // Deduplica por id: a mesma skill pode vir aninhada em multiplos pais —
  // mantemos apenas a primeira ocorrencia para evitar duplicatas em listas/selects.
  getSkillTree(): Observable<SkillTree[]> {
    if (this.cachedTree) {
      return of(this.cachedTree);
    }

    return this.api.get<{ data: SkillTree[] }>('/skills').pipe(
      map((res) => this.dedupTree(res.data)),
      tap((tree) => this.cachedTree = tree),
    );
  }

  private dedupTree(tree: SkillTree[]): SkillTree[] {
    const seen = new Set<string>();
    const visit = (items: SkillTree[]): SkillTree[] => {
      const result: SkillTree[] = [];
      for (const s of items) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        result.push({
          ...s,
          children: s.children ? visit(s.children) : [],
        });
      }
      return result;
    };
    return visit(tree);
  }

  getCategories(): Observable<string[]> {
    if (this.cachedCategories) {
      return of(this.cachedCategories);
    }

    return this.api.get<{ data: string[] }>('/skills/categories').pipe(
      map((res) => res.data),
      tap((cats) => this.cachedCategories = cats),
    );
  }

  // Dev Skills (autenticado)
  getMySkills(): Observable<DevSkill[]> {
    return this.api.get<{ data: DevSkill[] }>('/dev/skills').pipe(
      map((res) => res.data),
    );
  }

  addSkill(payload: CreateDevSkillPayload): Observable<DevSkill> {
    return this.api.post<{ data: DevSkill }>('/dev/skills', payload).pipe(
      map((res) => res.data),
    );
  }

  updateSkill(id: string, payload: UpdateDevSkillPayload): Observable<DevSkill> {
    return this.api.put<{ data: DevSkill }>(`/dev/skills/${id}`, payload).pipe(
      map((res) => res.data),
    );
  }

  removeSkill(id: string): Observable<void> {
    return this.api.delete<void>(`/dev/skills/${id}`);
  }
}
