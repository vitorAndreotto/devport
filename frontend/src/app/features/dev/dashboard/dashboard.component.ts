import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DevProfileService } from '../../../core/services/dev-profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly profileService = inject(DevProfileService);

  profileName = computed(() => this.profileService.currentProfile()?.full_name ?? '');

  readonly quickActions = [
    { path: '/dev/profile', label: 'Editar perfil', icon: 'user', description: 'Atualize suas informações profissionais' },
    { path: '/dev/skills', label: 'Gerenciar skills', icon: 'puzzle', description: 'Adicione ou edite suas habilidades' },
    { path: '/dev/education', label: 'Formação', icon: 'graduation-cap', description: 'Registre sua formação acadêmica' },
    { path: '/dev/projects', label: 'Projetos', icon: 'folder-git-2', description: 'Gerencie seus projetos e repos' },
    { path: '/dev/jobs', label: 'Buscar vagas', icon: 'briefcase', description: 'Encontre vagas com match' },
  ];
}
