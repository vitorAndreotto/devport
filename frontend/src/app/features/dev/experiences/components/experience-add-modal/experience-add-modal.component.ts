import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CreateExperiencePayload } from '../../../../../core/models/experience.model';

@Component({
  selector: 'app-experience-add-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './experience-add-modal.component.html',
  styleUrl: './experience-add-modal.component.scss',
})
export class ExperienceAddModalComponent {
  isAdding = input(false);

  close = output<void>();
  confirm = output<CreateExperiencePayload>();

  company = signal('');
  position = signal('');
  description = signal('');
  startDate = signal('');
  endDate = signal('');
  isCurrent = signal(false);

  get isValid(): boolean {
    return !!this.company() && !!this.position() && !!this.startDate();
  }

  onCurrentChange(checked: boolean): void {
    this.isCurrent.set(checked);
    if (checked) {
      this.endDate.set('');
    }
  }

  onConfirm(): void {
    if (!this.isValid) return;

    this.confirm.emit({
      company: this.company(),
      position: this.position(),
      description: this.description() || undefined,
      start_date: this.startDate(),
      end_date: this.endDate() || undefined,
      is_current: this.isCurrent(),
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
