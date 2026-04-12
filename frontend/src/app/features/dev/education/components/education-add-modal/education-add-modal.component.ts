import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CreateEducationPayload, EDUCATION_TYPES } from '../../../../../core/models/education.model';

@Component({
  selector: 'app-education-add-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './education-add-modal.component.html',
  styleUrl: './education-add-modal.component.scss',
})
export class EducationAddModalComponent {
  isAdding = input(false);

  close = output<void>();
  confirm = output<CreateEducationPayload>();

  readonly types = EDUCATION_TYPES;

  institution = signal('');
  course = signal('');
  type = signal('graduation');
  workloadHours = signal<number | null>(null);
  startDate = signal('');
  endDate = signal('');
  isOngoing = signal(false);

  readonly isCourse = computed(() => this.type() === 'course');

  get isValid(): boolean {
    const base = !!this.institution() && !!this.course() && !!this.type();
    if (this.isCourse() && !this.workloadHours()) return false;
    return base;
  }

  onOngoingChange(checked: boolean): void {
    this.isOngoing.set(checked);
    if (checked) {
      this.endDate.set('');
    }
  }

  onConfirm(): void {
    if (!this.isValid) return;

    this.confirm.emit({
      institution: this.institution(),
      course: this.course(),
      type: this.type(),
      workload_hours: this.workloadHours() ?? undefined,
      start_date: this.startDate() || undefined,
      end_date: this.endDate() || undefined,
      is_ongoing: this.isOngoing(),
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
