import { Component, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/api/api.service';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, LucideAngularModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  role = input.required<UserRole>();
  back = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  apiError = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, {
    validators: [this.passwordMatchValidator],
  });

  get roleLabel(): string {
    return this.role() === 'dev' ? 'Navio' : 'Porto';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(null);

    const { name, email, password, password_confirmation } = this.form.getRawValue();

    this.authService.register(
      { name: name!, email: email!, password: password!, password_confirmation: password_confirmation! },
      this.role(),
    ).subscribe({
      next: () => {
        const redirect = this.role() === 'dev' ? '/dev' : '/company';
        this.router.navigate([redirect]);
      },
      error: (err: ApiError) => {
        this.isLoading.set(false);
        const message = Array.isArray(err.message) ? err.message[0] : err.message;
        this.apiError.set(message);
      },
    });
  }

  goBack(): void {
    this.back.emit();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('password_confirmation');

    if (password && confirmation && password.value !== confirmation.value) {
      confirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
