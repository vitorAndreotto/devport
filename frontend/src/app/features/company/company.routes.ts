import { Routes } from '@angular/router';
import { CompanyLayoutComponent } from '../../layouts/company-layout/company-layout.component';
import { hasCompanyProfileGuard, noCompanyProfileGuard } from '../../core/guards/company-profile.guard';
import { CompanyDashboardComponent } from './dashboard/dashboard.component';
import { CompanyProfileComponent } from './profile/profile.component';
import { CompanyJobsComponent } from './jobs/jobs.component';
import { JobFormComponent } from './jobs/job-form/job-form.component';
import { CompanyUnitsComponent } from './units/units.component';
import { CompanyOnboardingComponent } from './onboarding/onboarding.component';

export const companyRoutes: Routes = [
  {
    path: 'onboarding',
    component: CompanyOnboardingComponent,
    canActivate: [noCompanyProfileGuard],
  },
  {
    path: '',
    component: CompanyLayoutComponent,
    canActivate: [hasCompanyProfileGuard],
    children: [
      { path: '', component: CompanyDashboardComponent },
      { path: 'profile', component: CompanyProfileComponent },
      { path: 'units', component: CompanyUnitsComponent },
      { path: 'jobs', component: CompanyJobsComponent },
      { path: 'jobs/new', component: JobFormComponent },
      { path: 'jobs/:id/edit', component: JobFormComponent },
    ],
  },
];
