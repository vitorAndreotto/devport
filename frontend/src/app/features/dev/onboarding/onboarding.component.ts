import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HandleInputComponent, HandleStatus } from '../../../shared/components/handle-input/handle-input.component';
import { DevProfileService } from '../../../core/services/dev-profile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/api/api.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, HandleInputComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(DevProfileService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  apiError = signal<string | null>(null);
  handleAvailable = signal(false);

  form = this.fb.group({
    handle: [''],
    full_name: ['', [Validators.required, Validators.maxLength(255)]],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    bio: ['', [Validators.required, Validators.maxLength(500)]],
    email_contact: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const userEmail = this.authService.user()?.email ?? '';
    this.form.controls.email_contact.setValue(userEmail);
  }

  get canSubmit(): boolean {
    return this.handleAvailable() && !this.isLoading();
  }

  onHandleStatus(status: HandleStatus): void {
    this.handleAvailable.set(status === 'available');
  }

  onSubmit(): void {
    if (this.form.invalid || !this.handleAvailable()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(null);

    const data = this.form.getRawValue();

    this.profileService.create({
      handle: data.handle!,
      full_name: data.full_name!,
      title: data.title!,
      bio: data.bio!,
      email_contact: data.email_contact!,
    }).subscribe({
      next: () => {
        this.router.navigate(['/dev']);
      },
      error: (err: ApiError) => {
        this.isLoading.set(false);
        const msg = Array.isArray(err.message) ? err.message[0] : err.message;
        this.apiError.set(msg);
      },
    });
  }
}
