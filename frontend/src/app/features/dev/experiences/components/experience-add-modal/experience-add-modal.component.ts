import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CreateExperiencePayload } from '../../../../../core/models/experience.model';
import { SkillTree, SKILL_CATEGORIES } from '../../../../../core/models/skill.model';

@Component({
  selector: 'app-experience-add-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './experience-add-modal.component.html',
  styleUrl: './experience-add-modal.component.scss',
})
export class ExperienceAddModalComponent {
  isAdding = input(false);
  skillTree = input<SkillTree[]>([]);

  close = output<void>();
  confirm = output<CreateExperiencePayload>();

  readonly categoryLabels = SKILL_CATEGORIES;

  company = signal('');
  position = signal('');
  description = signal('');
  startDate = signal('');
  endDate = signal('');
  isCurrent = signal(false);
  selectedSkillIds = signal<Set<string>>(new Set());
  showSkillPicker = signal(false);
  skillSearch = signal('');

  filteredSkillTree = computed(() => {
    const tree = this.skillTree();
    const q = this.skillSearch().toLowerCase();
    if (q.length < 2) return tree;
    return tree.filter((s) => s.name.toLowerCase().includes(q));
  });

  get isValid(): boolean {
    return !!this.company() && !!this.position() && !!this.startDate();
  }

  onCurrentChange(checked: boolean): void {
    this.isCurrent.set(checked);
    if (checked) {
      this.endDate.set('');
    }
  }

  toggleSkill(skillId: string): void {
    this.selectedSkillIds.update((ids) => {
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
    this.selectedSkillIds.update((ids) => {
      const next = new Set(ids);
      next.delete(skillId);
      return next;
    });
  }

  getSkillName(skillId: string): string {
    return this.skillTree().find((s) => s.id === skillId)?.name ?? skillId;
  }

  onConfirm(): void {
    if (!this.isValid) return;

    const skillIds = [...this.selectedSkillIds()];

    this.confirm.emit({
      company: this.company(),
      position: this.position(),
      description: this.description() || undefined,
      start_date: this.startDate(),
      end_date: this.endDate() || undefined,
      is_current: this.isCurrent(),
      skill_ids: skillIds.length > 0 ? skillIds : undefined,
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
