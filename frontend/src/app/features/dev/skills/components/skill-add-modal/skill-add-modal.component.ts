import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SkillTree, SKILL_LEVELS, SKILL_CATEGORIES } from '../../../../../core/models/skill.model';

export interface SkillAddPayload {
  skill: SkillTree;
  level: string;
  years_experience: number | null;
}

@Component({
  selector: 'app-skill-add-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './skill-add-modal.component.html',
  styleUrl: './skill-add-modal.component.scss',
})
export class SkillAddModalComponent {
  skillTree = input.required<SkillTree[]>();
  categories = input.required<string[]>();
  existingSkillIds = input.required<Set<string>>();
  isAdding = input(false);

  close = output<void>();
  confirm = output<SkillAddPayload>();

  readonly levels = SKILL_LEVELS;
  readonly categoryLabels = SKILL_CATEGORIES;

  searchQuery = signal('');
  selectedCategory = signal('');
  selectedSkill = signal<SkillTree | null>(null);
  level = signal('intermediate');
  years = signal<number | null>(null);

  filteredTree = computed(() => {
    let tree = this.skillTree();
    const cat = this.selectedCategory();
    const q = this.searchQuery().toLowerCase();

    if (cat) {
      tree = tree.filter((s) => s.category === cat);
    }
    if (q.length >= 2) {
      tree = tree.filter((s) => s.name.toLowerCase().includes(q));
    }

    const existing = this.existingSkillIds();
    return tree.filter((s) => !existing.has(s.id));
  });

  selectSkill(skill: SkillTree): void {
    this.selectedSkill.set(skill);
  }

  clearSelection(): void {
    this.selectedSkill.set(null);
  }

  onConfirm(): void {
    const skill = this.selectedSkill();
    if (!skill) return;

    this.confirm.emit({
      skill,
      level: this.level(),
      years_experience: this.years(),
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
