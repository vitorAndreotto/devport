import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Education, EDUCATION_TYPES } from '../../../../../core/models/education.model';

export interface EducationEditPayload {
  institution: string;
  course: string;
  type: string;
  workload_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
}

@Component({
  selector: 'app-education-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './education-card.component.html',
  styleUrl: './education-card.component.scss',
})
export class EducationCardComponent {
  education = input.required<Education>();
  saving = input(false);

  edit = output<EducationEditPayload>();
  remove = output<void>();

  readonly types = EDUCATION_TYPES;

  isEditing = signal(false);
  editInstitution = signal('');
  editCourse = signal('');
  editType = signal('');
  editWorkloadHours = signal<number | null>(null);
  editStartDate = signal<string | null>(null);
  editEndDate = signal<string | null>(null);
  editIsOngoing = signal(false);

  startEdit(): void {
    const e = this.education();
    this.editInstitution.set(e.institution);
    this.editCourse.set(e.course);
    this.editType.set(e.type);
    this.editWorkloadHours.set(e.workload_hours);
    this.editStartDate.set(e.start_date);
    this.editEndDate.set(e.end_date);
    this.editIsOngoing.set(e.is_ongoing);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    this.edit.emit({
      institution: this.editInstitution(),
      course: this.editCourse(),
      type: this.editType(),
      workload_hours: this.editWorkloadHours(),
      start_date: this.editStartDate(),
      end_date: this.editIsOngoing() ? null : this.editEndDate(),
      is_ongoing: this.editIsOngoing(),
    });
    this.isEditing.set(false);
  }

  onOngoingChange(checked: boolean): void {
    this.editIsOngoing.set(checked);
    if (checked) {
      this.editEndDate.set(null);
    }
  }

  getTypeLabel(value: string): string {
    return this.types.find((t) => t.value === value)?.label ?? value;
  }

  formatPeriod(edu: Education): string {
    const parts: string[] = [];
    if (edu.start_date) parts.push(this.formatMonth(edu.start_date));
    if (edu.is_ongoing) {
      parts.push('Cursando');
    } else if (edu.end_date) {
      parts.push(this.formatMonth(edu.end_date));
    }
    return parts.join(' — ') || '';
  }

  private formatMonth(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  }
}
