import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { SkillService } from '../../../core/services/skill.service';
import { NotificationService } from '../../../core/services/notification.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { ApiError } from '../../../core/api/api.service';
import { DevSkill, SkillTree, SKILL_CATEGORIES } from '../../../core/models/skill.model';
import { SkillCardComponent } from './components/skill-card/skill-card.component';
import { SkillAddModalComponent, SkillAddPayload } from './components/skill-add-modal/skill-add-modal.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [LucideAngularModule, SkillCardComponent, SkillAddModalComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent implements OnInit {
  private readonly skillService = inject(SkillService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mySkills = signal<DevSkill[]>([]);
  readonly skillTree = signal<SkillTree[]>([]);
  readonly categories = signal<string[]>([]);
  readonly isLoading = signal(true);
  readonly showAddModal = signal(false);
  readonly isAdding = signal(false);
  readonly isSavingEdit = signal(false);
  readonly categoryLabels = SKILL_CATEGORIES;

  readonly existingSkillIds = computed(() =>
    new Set(this.mySkills().map((s) => s.skill.id)),
  );

  readonly groupedSkills = computed(() => {
    const skills = this.mySkills();
    const groups: Record<string, DevSkill[]> = {};

    for (const skill of skills) {
      const cat = skill.skill.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  });

  ngOnInit(): void {
    this.loadData();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddSkill(payload: SkillAddPayload): void {
    this.isAdding.set(true);

    this.skillService.addSkill({
      skill_id: payload.skill.id,
      level: payload.level,
      years_experience: payload.years_experience ?? undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (added) => {
          this.mySkills.update((s) => [...s, added]);
          this.isAdding.set(false);
          this.closeAddModal();
          this.notify.success(`${payload.skill.name} adicionada!`);
        },
        error: (err: ApiError) => {
          this.isAdding.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onEditSkill(skill: DevSkill, data: { level: string; years_experience: number | null }): void {
    this.isSavingEdit.set(true);

    this.skillService.updateSkill(skill.id, {
      level: data.level,
      years_experience: data.years_experience ?? undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.mySkills.update((skills) =>
            skills.map((s) => (s.id === updated.id ? updated : s)),
          );
          this.isSavingEdit.set(false);
          this.notify.success(`${skill.skill.name} atualizada!`);
        },
        error: (err: ApiError) => {
          this.isSavingEdit.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onRemoveSkill(skill: DevSkill): void {
    this.skillService.removeSkill(skill.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.mySkills.update((skills) => skills.filter((s) => s.id !== skill.id));
          this.notify.success(`${skill.skill.name} removida.`);
        },
        error: (err: ApiError) => {
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.skillService.getMySkills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((skills) => {
        this.mySkills.set(skills);
        this.isLoading.set(false);
      });

    this.skillService.getSkillTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tree) => this.skillTree.set(tree));

    this.skillService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cats) => this.categories.set(cats));
  }
}
