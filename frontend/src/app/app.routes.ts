import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { devGuard, companyGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'dev',
    canActivate: [devGuard],
    loadChildren: () => import('./features/dev/dev.routes').then((m) => m.devRoutes),
  },
  {
    path: 'company',
    canActivate: [companyGuard],
    loadChildren: () => import('./features/company/company.routes').then((m) => m.companyRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
