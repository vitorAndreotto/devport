import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CompanyProfileService } from '../../../core/services/company-profile.service';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class CompanyDashboardComponent {
  private readonly profileService = inject(CompanyProfileService);

  profileName = computed(() => this.profileService.currentProfile()?.company_name ?? '');

  readonly quickActions = [
    { path: '/company/profile', label: 'Registro do Porto', icon: 'building-2', description: 'Atualize a identidade e dados do porto' },
    { path: '/company/units', label: 'Docas', icon: 'map-pin', description: 'Gerencie as docas e filiais do porto' },
    { path: '/company/jobs', label: 'Abrir Rotas', icon: 'compass', description: 'Publique rotas para atrair navios' },
  ];
}
