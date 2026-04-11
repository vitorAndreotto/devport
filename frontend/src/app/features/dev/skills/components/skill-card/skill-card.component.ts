import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DevSkill, SKILL_LEVELS } from '../../../../../core/models/skill.model';

@Component({
  selector: 'app-skill-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './skill-card.component.html',
  styleUrl: './skill-card.component.scss',
})
export class SkillCardComponent {
  skill = input.required<DevSkill>();
  saving = input(false);

  edit = output<{ level: string; years_experience: number | null }>();
  remove = output<void>();

  readonly levels = SKILL_LEVELS;

  isEditing = signal(false);
  editLevel = signal('');
  editYears = signal<number | null>(null);

  startEdit(): void {
    const s = this.skill();
    this.editLevel.set(s.level);
    this.editYears.set(s.years_experience);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    this.edit.emit({
      level: this.editLevel(),
      years_experience: this.editYears(),
    });
    this.isEditing.set(false);
  }

  getLevelLabel(value: string): string {
    return this.levels.find((l) => l.value === value)?.label ?? value;
  }
}
