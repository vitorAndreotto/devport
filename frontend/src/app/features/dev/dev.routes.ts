import { Routes } from '@angular/router';
import { DevLayoutComponent } from '../../layouts/dev-layout/dev-layout.component';
import { hasProfileGuard, noProfileGuard } from '../../core/guards/profile.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SkillsComponent } from './skills/skills.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { EducationComponent } from './education/education.component';
import { ProjectsComponent } from './projects/projects.component';
import { DevJobsComponent } from './jobs/jobs.component';
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
      { path: 'skills', component: SkillsComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'education', component: EducationComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'jobs', component: DevJobsComponent },
    ],
  },
];
