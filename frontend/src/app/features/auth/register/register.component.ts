import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UserRole } from '../../../core/models/user.model';
import { RegisterFormComponent } from './register-form/register-form.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, RegisterFormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  selectedRole = signal<UserRole | null>(null);

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  goBack(): void {
    this.selectedRole.set(null);
  }
}
