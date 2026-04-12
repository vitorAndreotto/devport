import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CreateProjectPayload } from '../../../../../core/models/project.model';

@Component({
  selector: 'app-project-add-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './project-add-modal.component.html',
  styleUrl: './project-add-modal.component.scss',
})
export class ProjectAddModalComponent {
  isAdding = input(false);

  close = output<void>();
  confirm = output<CreateProjectPayload>();

  name = signal('');
  description = signal('');
  technologies = signal('');
  repositoryUrl = signal('');
  demoUrl = signal('');
  imageUrl = signal('');

  get isValid(): boolean {
    return !!this.name() && !!this.description();
  }

  onConfirm(): void {
    if (!this.isValid) return;

    const techs = this.technologies()
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    this.confirm.emit({
      name: this.name(),
      description: this.description(),
      technologies: techs.length > 0 ? techs : undefined,
      repository_url: this.repositoryUrl() || undefined,
      demo_url: this.demoUrl() || undefined,
      image_url: this.imageUrl() || undefined,
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
