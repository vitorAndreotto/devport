import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { DevProfileService } from '../../../core/services/dev-profile.service';
import { SkillService } from '../../../core/services/skill.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { EducationService } from '../../../core/services/education.service';

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
  private readonly destroyRef = inject(DestroyRef);

  profileName = computed(() => this.profileService.currentProfile()?.full_name ?? '');
  skillCount = signal(0);
  experienceCount = signal(0);
  educationCount = signal(0);

  readonly quickActions = [
    { path: '/dev/profile', label: 'Editar perfil', icon: 'user', description: 'Atualize suas informações profissionais' },
    { path: '/dev/skills', label: 'Gerenciar skills', icon: 'puzzle', description: 'Adicione ou edite suas habilidades' },
    { path: '/dev/experiences', label: 'Experiências', icon: 'briefcase', description: 'Gerencie seu histórico profissional' },
    { path: '/dev/education', label: 'Formação', icon: 'graduation-cap', description: 'Registre sua formação acadêmica' },
    { path: '/dev/projects', label: 'Projetos', icon: 'folder-git-2', description: 'Gerencie seus projetos e repos' },
    { path: '/dev/jobs', label: 'Buscar vagas', icon: 'compass', description: 'Encontre vagas com match' },
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
  }
}
