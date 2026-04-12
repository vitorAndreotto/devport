import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { ExperienceService } from '../../../core/services/experience.service';
import { SkillService } from '../../../core/services/skill.service';
import { NotificationService } from '../../../core/services/notification.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { ApiError } from '../../../core/api/api.service';
import { Experience, CreateExperiencePayload } from '../../../core/models/experience.model';
import { SkillTree } from '../../../core/models/skill.model';
import { ExperienceCardComponent, ExperienceEditPayload } from './components/experience-card/experience-card.component';
import { ExperienceAddModalComponent } from './components/experience-add-modal/experience-add-modal.component';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [LucideAngularModule, ExperienceCardComponent, ExperienceAddModalComponent],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss',
})
export class ExperiencesComponent implements OnInit {
  private readonly experienceService = inject(ExperienceService);
  private readonly skillService = inject(SkillService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly experiences = signal<Experience[]>([]);
  readonly skillTree = signal<SkillTree[]>([]);
  readonly isLoading = signal(true);
  readonly showAddModal = signal(false);
  readonly isAdding = signal(false);
  readonly isSavingEdit = signal(false);

  ngOnInit(): void {
    this.loadExperiences();
    this.loadSkillTree();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddExperience(payload: CreateExperiencePayload): void {
    this.isAdding.set(true);

    this.experienceService.addExperience(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (added) => {
          this.experiences.update((list) => [added, ...list]);
          this.isAdding.set(false);
          this.closeAddModal();
          this.notify.success('Experiência adicionada!');
        },
        error: (err: ApiError) => {
          this.isAdding.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onEditExperience(exp: Experience, data: ExperienceEditPayload): void {
    this.isSavingEdit.set(true);

    this.experienceService.updateExperience(exp.id, {
      company: data.company,
      position: data.position,
      description: data.description ?? undefined,
      start_date: data.start_date,
      end_date: data.end_date,
      is_current: data.is_current,
      skill_ids: data.skill_ids,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.experiences.update((list) =>
            list.map((e) => (e.id === updated.id ? updated : e)),
          );
          this.isSavingEdit.set(false);
          this.notify.success('Experiência atualizada!');
        },
        error: (err: ApiError) => {
          this.isSavingEdit.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onRemoveExperience(exp: Experience): void {
    this.experienceService.removeExperience(exp.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.experiences.update((list) => list.filter((e) => e.id !== exp.id));
          this.notify.success('Experiência removida.');
        },
        error: (err: ApiError) => {
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  private loadExperiences(): void {
    this.isLoading.set(true);

    this.experienceService.getMyExperiences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.experiences.set(list);
          this.isLoading.set(false);
        },
        error: (err: ApiError) => {
          this.isLoading.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  private loadSkillTree(): void {
    this.skillService.getSkillTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tree) => this.skillTree.set(tree));
  }
}
