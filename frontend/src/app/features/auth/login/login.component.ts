import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/api/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  apiError = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        const role = res.data.user.role;
        const redirect = role === 'dev' ? '/dev' : '/company';
        this.router.navigate([redirect]);
      },
      error: (err: ApiError) => {
        this.isLoading.set(false);
        const msg = Array.isArray(err.message) ? err.message[0] : err.message;
        this.apiError.set(msg);
      },
    });
  }
}
