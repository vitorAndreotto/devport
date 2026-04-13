import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HandleInputComponent, HandleCheckFn } from '../../../shared/components/handle-input/handle-input.component';
import type { HandleStatus } from '../../../shared/components/handle-input/handle-input.component';
import { CnpjMaskDirective } from '../../../shared/directives/cnpj-mask.directive';
import { CompanyProfileService } from '../../../core/services/company-profile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/api/api.service';

@Component({
  selector: 'app-company-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, HandleInputComponent, CnpjMaskDirective],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class CompanyOnboardingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(CompanyProfileService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  apiError = signal<string | null>(null);
  handleAvailable = signal(false);

  readonly handleCheckFn: HandleCheckFn = (handle) => this.profileService.checkHandle(handle);

  form = this.fb.group({
    handle: [''],
    company_name: ['', [Validators.required, Validators.maxLength(255)]],
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    industry: ['', [Validators.required, Validators.maxLength(255)]],
    size: ['', Validators.required],
  });

  ngOnInit(): void {}

  get canSubmit(): boolean {
    return this.handleAvailable() && !this.isLoading();
  }

  get descriptionLength(): number {
    return this.form.controls.description.value?.length ?? 0;
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
      company_name: data.company_name!,
      cnpj: data.cnpj!,
      description: data.description!,
      industry: data.industry!,
      size: data.size!,
    }).subscribe({
      next: () => {
        this.router.navigate(['/company']);
      },
      error: (err: ApiError) => {
        this.isLoading.set(false);
        const msg = Array.isArray(err.message) ? err.message[0] : err.message;
        this.apiError.set(msg);
      },
    });
  }
}
