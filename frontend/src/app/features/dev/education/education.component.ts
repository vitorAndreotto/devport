import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { EducationService } from '../../../core/services/education.service';
import { NotificationService } from '../../../core/services/notification.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { ApiError } from '../../../core/api/api.service';
import { Education, CreateEducationPayload } from '../../../core/models/education.model';
import { EducationCardComponent, EducationEditPayload } from './components/education-card/education-card.component';
import { EducationAddModalComponent } from './components/education-add-modal/education-add-modal.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [LucideAngularModule, EducationCardComponent, EducationAddModalComponent],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent implements OnInit {
  private readonly educationService = inject(EducationService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly educations = signal<Education[]>([]);
  readonly isLoading = signal(true);
  readonly showAddModal = signal(false);
  readonly isAdding = signal(false);
  readonly isSavingEdit = signal(false);

  ngOnInit(): void {
    this.loadEducations();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddEducation(payload: CreateEducationPayload): void {
    this.isAdding.set(true);

    this.educationService.addEducation(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (added) => {
          this.educations.update((list) => [added, ...list]);
          this.isAdding.set(false);
          this.closeAddModal();
          this.notify.success('Formação adicionada!');
        },
        error: (err: ApiError) => {
          this.isAdding.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onEditEducation(edu: Education, data: EducationEditPayload): void {
    this.isSavingEdit.set(true);

    this.educationService.updateEducation(edu.id, {
      institution: data.institution,
      course: data.course,
      type: data.type,
      workload_hours: data.workload_hours,
      start_date: data.start_date,
      end_date: data.end_date,
      is_ongoing: data.is_ongoing,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.educations.update((list) =>
            list.map((e) => (e.id === updated.id ? updated : e)),
          );
          this.isSavingEdit.set(false);
          this.notify.success('Formação atualizada!');
        },
        error: (err: ApiError) => {
          this.isSavingEdit.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onRemoveEducation(edu: Education): void {
    this.educationService.removeEducation(edu.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.educations.update((list) => list.filter((e) => e.id !== edu.id));
          this.notify.success('Formação removida.');
        },
        error: (err: ApiError) => {
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  private loadEducations(): void {
    this.isLoading.set(true);

    this.educationService.getMyEducations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.educations.set(list);
          this.isLoading.set(false);
        },
        error: (err: ApiError) => {
          this.isLoading.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }
}
