import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { CompanyProfileService } from '../../core/services/company-profile.service';

@Component({
  selector: 'app-company-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './company-layout.component.html',
  styleUrl: './company-layout.component.scss',
})
export class CompanyLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(CompanyProfileService);

  sidebarOpen = signal(false);

  userName = computed(() => this.authService.user()?.name ?? '');
  profileName = computed(() => this.profileService.currentProfile()?.company_name ?? this.userName());
  profileLogo = computed(() => this.profileService.currentProfile()?.logo_url ?? null);
  profileInitial = computed(() => this.profileName().charAt(0).toUpperCase());

  readonly navItems = [
    { path: '/company', label: 'Início', icon: 'layout-dashboard', exact: true },
    { path: '/company/profile', label: 'Perfil', icon: 'building-2', exact: false },
    { path: '/company/units', label: 'Unidades', icon: 'map-pin', exact: false },
    { path: '/company/jobs', label: 'Vagas', icon: 'compass', exact: false },
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
