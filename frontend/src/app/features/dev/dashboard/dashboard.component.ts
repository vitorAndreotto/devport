import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { DevProfileService } from '../../../core/services/dev-profile.service';
import { SkillService } from '../../../core/services/skill.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { EducationService } from '../../../core/services/education.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly profileService = inject(DevProfileService);
  private readonly skillService = inject(SkillService);
  private readonly experienceService = inject(ExperienceService);
  private readonly educationService = inject(EducationService);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  profileName = computed(() => this.profileService.currentProfile()?.full_name ?? '');
  skillCount = signal(0);
  experienceCount = signal(0);
  educationCount = signal(0);
  projectCount = signal(0);

  readonly quickActions = [
    { path: '/dev/profile', label: 'Registro da Embarcação', icon: 'user', description: 'Atualize a identidade do seu navio' },
    { path: '/dev/skills', label: 'Equipamentos de Bordo', icon: 'compass', description: 'Gerencie suas ferramentas e tecnologias' },
    { path: '/dev/experiences', label: 'Diário de Bordo', icon: 'anchor', description: 'Registre os portos por onde ancorou' },
    { path: '/dev/education', label: 'Carta Náutica', icon: 'graduation-cap', description: 'Suas habilitações de navegação' },
    { path: '/dev/projects', label: 'Cargas do Porto', icon: 'folder-git-2', description: 'Projetos que você transportou' },
    { path: '/dev/jobs', label: 'Rotas Disponíveis', icon: 'compass', description: 'Navegue até as melhores oportunidades' },
  ];

  ngOnInit(): void {
    this.skillService.getMySkills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((skills) => this.skillCount.set(skills.length));

    this.experienceService.getMyExperiences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((experiences) => this.experienceCount.set(experiences.length));

    this.educationService.getMyEducations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((educations) => this.educationCount.set(educations.length));

    this.projectService.getMyProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projects) => this.projectCount.set(projects.length));
  }
}
