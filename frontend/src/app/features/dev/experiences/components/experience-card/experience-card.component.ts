import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Experience, ExperienceSkill } from '../../../../../core/models/experience.model';
import { SkillTree, SKILL_CATEGORIES } from '../../../../../core/models/skill.model';

export interface ExperienceEditPayload {
  company: string;
  position: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  skill_ids: string[];
}

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './experience-card.component.html',
  styleUrl: './experience-card.component.scss',
})
export class ExperienceCardComponent {
  experience = input.required<Experience>();
  skillTree = input<SkillTree[]>([]);
  saving = input(false);

  edit = output<ExperienceEditPayload>();
  remove = output<void>();

  readonly categoryLabels = SKILL_CATEGORIES;

  isEditing = signal(false);
  editCompany = signal('');
  editPosition = signal('');
  editDescription = signal<string | null>(null);
  editStartDate = signal('');
  editEndDate = signal<string | null>(null);
  editIsCurrent = signal(false);
  editSkillIds = signal<Set<string>>(new Set());
  showSkillPicker = signal(false);
  skillSearch = signal('');

  filteredSkillTree = computed(() => {
    const tree = this.skillTree();
    const q = this.skillSearch().toLowerCase();
    if (q.length < 2) return tree;
    return tree.filter((s) => s.name.toLowerCase().includes(q));
  });

  startEdit(): void {
    const e = this.experience();
    this.editCompany.set(e.company);
    this.editPosition.set(e.position);
    this.editDescription.set(e.description);
    this.editStartDate.set(e.start_date);
    this.editEndDate.set(e.end_date);
    this.editIsCurrent.set(e.is_current);
    this.editSkillIds.set(new Set(e.skills.map((s) => s.id)));
    this.showSkillPicker.set(false);
    this.skillSearch.set('');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    this.edit.emit({
      company: this.editCompany(),
      position: this.editPosition(),
      description: this.editDescription(),
      start_date: this.editStartDate(),
      end_date: this.editIsCurrent() ? null : this.editEndDate(),
      is_current: this.editIsCurrent(),
      skill_ids: [...this.editSkillIds()],
    });
    this.isEditing.set(false);
  }

  onCurrentChange(checked: boolean): void {
    this.editIsCurrent.set(checked);
    if (checked) {
      this.editEndDate.set(null);
    }
  }

  toggleSkill(skillId: string): void {
    this.editSkillIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else if (next.size < 20) {
        next.add(skillId);
      }
      return next;
    });
  }

  removeSkillTag(skillId: string): void {
    this.editSkillIds.update((ids) => {
      const next = new Set(ids);
      next.delete(skillId);
      return next;
    });
  }

  getSkillName(skillId: string): string {
    return this.skillTree().find((s) => s.id === skillId)?.name ?? skillId;
  }

  formatPeriod(exp: Experience): string {
    const start = this.formatMonth(exp.start_date);
    if (exp.is_current) return `${start} — Atual`;
    if (exp.end_date) return `${start} — ${this.formatMonth(exp.end_date)}`;
    return start;
  }

  private formatMonth(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  }
}
