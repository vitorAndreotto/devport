import { Routes } from '@angular/router';
import { DevLayoutComponent } from '../../layouts/dev-layout/dev-layout.component';
import { hasProfileGuard, noProfileGuard } from '../../core/guards/profile.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

export const devRoutes: Routes = [
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [noProfileGuard],
  },
  {
    path: '',
    component: DevLayoutComponent,
    canActivate: [hasProfileGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
