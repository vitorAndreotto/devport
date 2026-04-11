import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { DevProfileService } from '../../core/services/dev-profile.service';

@Component({
  selector: 'app-dev-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './dev-layout.component.html',
  styleUrl: './dev-layout.component.scss',
})
export class DevLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(DevProfileService);

  sidebarOpen = signal(false);

  userName = computed(() => this.authService.user()?.name ?? '');
  profileName = computed(() => this.profileService.currentProfile()?.full_name ?? this.userName());
  profileAvatar = computed(() => this.profileService.currentProfile()?.avatar_url ?? null);
  profileInitial = computed(() => this.profileName().charAt(0).toUpperCase());

  readonly navItems = [
    { path: '/dev', label: 'Início', icon: 'layout-dashboard', exact: true },
    { path: '/dev/profile', label: 'Perfil', icon: 'user', exact: false },
    { path: '/dev/skills', label: 'Skills', icon: 'puzzle', exact: false },
    { path: '/dev/experiences', label: 'Experiências', icon: 'briefcase', exact: false },
    { path: '/dev/education', label: 'Formação', icon: 'graduation-cap', exact: false },
    { path: '/dev/projects', label: 'Projetos', icon: 'folder-git-2', exact: false },
    { path: '/dev/jobs', label: 'Vagas', icon: 'compass', exact: false },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.profileService.clearProfile();
    this.authService.logout();
  }
}
