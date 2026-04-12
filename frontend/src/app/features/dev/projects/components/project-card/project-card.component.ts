import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../../../../core/models/project.model';

export interface ProjectEditPayload {
  name: string;
  description: string;
  technologies: string[];
  repository_url: string | null;
  demo_url: string | null;
  image_url: string | null;
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  project = input.required<Project>();
  saving = input(false);

  edit = output<ProjectEditPayload>();
  remove = output<void>();

  isEditing = signal(false);
  editName = signal('');
  editDescription = signal('');
  editTechnologies = signal('');
  editRepoUrl = signal('');
  editDemoUrl = signal('');
  editImageUrl = signal('');

  startEdit(): void {
    const p = this.project();
    this.editName.set(p.name);
    this.editDescription.set(p.description);
    this.editTechnologies.set(p.technologies?.join(', ') ?? '');
    this.editRepoUrl.set(p.repository_url ?? '');
    this.editDemoUrl.set(p.demo_url ?? '');
    this.editImageUrl.set(p.image_url ?? '');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    const techs = this.editTechnologies()
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    this.edit.emit({
      name: this.editName(),
      description: this.editDescription(),
      technologies: techs,
      repository_url: this.editRepoUrl() || null,
      demo_url: this.editDemoUrl() || null,
      image_url: this.editImageUrl() || null,
    });
    this.isEditing.set(false);
  }
}
