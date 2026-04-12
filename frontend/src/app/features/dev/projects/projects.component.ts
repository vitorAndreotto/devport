import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { ApiError } from '../../../core/api/api.service';
import { Project, CreateProjectPayload } from '../../../core/models/project.model';
import { ProjectCardComponent, ProjectEditPayload } from './components/project-card/project-card.component';
import { ProjectAddModalComponent } from './components/project-add-modal/project-add-modal.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [LucideAngularModule, ProjectCardComponent, ProjectAddModalComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = signal<Project[]>([]);
  readonly isLoading = signal(true);
  readonly showAddModal = signal(false);
  readonly isAdding = signal(false);
  readonly isSavingEdit = signal(false);

  ngOnInit(): void {
    this.loadProjects();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onAddProject(payload: CreateProjectPayload): void {
    this.isAdding.set(true);

    this.projectService.addProject(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (added) => {
          this.projects.update((list) => [added, ...list]);
          this.isAdding.set(false);
          this.closeAddModal();
          this.notify.success(`${added.name} registrado!`);
        },
        error: (err: ApiError) => {
          this.isAdding.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onEditProject(project: Project, data: ProjectEditPayload): void {
    this.isSavingEdit.set(true);

    this.projectService.updateProject(project.id, {
      name: data.name,
      description: data.description,
      technologies: data.technologies.length > 0 ? data.technologies : undefined,
      repository_url: data.repository_url,
      demo_url: data.demo_url,
      image_url: data.image_url,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.projects.update((list) =>
            list.map((p) => (p.id === updated.id ? updated : p)),
          );
          this.isSavingEdit.set(false);
          this.notify.success(`${updated.name} atualizado!`);
        },
        error: (err: ApiError) => {
          this.isSavingEdit.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  onRemoveProject(project: Project): void {
    this.projectService.removeProject(project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.projects.update((list) => list.filter((p) => p.id !== project.id));
          this.notify.success(`${project.name} removido.`);
        },
        error: (err: ApiError) => {
          this.notify.error(extractErrorMessage(err));
        },
      });
  }

  private loadProjects(): void {
    this.isLoading.set(true);

    this.projectService.getMyProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.projects.set(list);
          this.isLoading.set(false);
        },
        error: (err: ApiError) => {
          this.isLoading.set(false);
          this.notify.error(extractErrorMessage(err));
        },
      });
  }
}
