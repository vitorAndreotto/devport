import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/register', component: RegisterComponent },
];
