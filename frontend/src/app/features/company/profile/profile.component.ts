import { Component, inject, signal, viewChild, OnInit, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HandleInputComponent, HandleCheckFn } from '../../../shared/components/handle-input/handle-input.component';
import type { HandleStatus } from '../../../shared/components/handle-input/handle-input.component';
import { CitySearchComponent } from '../../../shared/components/city-search/city-search.component';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';
import { CnpjMaskDirective } from '../../../shared/directives/cnpj-mask.directive';
import { CompanyProfileService } from '../../../core/services/company-profile.service';
import { LocationService } from '../../../core/services/location.service';
import { ViaCepService } from '../../../core/services/viacep.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { CompanyProfile } from '../../../core/models/company-profile.model';
import { State } from '../../../core/models/location.model';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, HandleInputComponent, CitySearchComponent, CepMaskDirective, CnpjMaskDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class CompanyProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(CompanyProfileService);
  private readonly locationService = inject(LocationService);
  private readonly viaCepService = inject(ViaCepService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notify = inject(NotificationService);

  citySearch = viewChild<CitySearchComponent>('citySearch');

  isLoading = signal(false);
  isSaving = signal(false);
  isFetchingCep = signal(false);
  handleAvailable = signal(true);
  states = signal<State[]>([]);

  readonly handleCheckFn: HandleCheckFn = (handle) => this.profileService.checkHandle(handle);

  form = this.fb.group({
    handle: [''],
    company_name: ['', [Validators.required, Validators.maxLength(255)]],
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    logo_url: [''],
    website: [''],
    industry: ['', [Validators.required, Validators.maxLength(255)]],
    size: ['', Validators.required],
    // Address
    state_id: [null as number | null],
    city_id: [null as number | null],
    zip_code: [''],
    street: [''],
    neighborhood: [''],
    number: [''],
    complement: [''],
    // Links
    links: this.fb.array([] as FormGroup[]),
  });

  get linksArray(): FormArray<FormGroup> {
    return this.form.controls.links;
  }

  get descriptionLength(): number {
    return this.form.controls.description.value?.length ?? 0;
  }

  get canSave(): boolean {
    return this.handleAvailable() && !this.isSaving();
  }

  ngOnInit(): void {
    this.loadStates().then(() => this.loadProfile());
  }

  onHandleStatus(status: HandleStatus): void {
    this.handleAvailable.set(status === 'available' || status === 'idle');
  }

  onStateChange(): void {
    this.form.controls.city_id.setValue(null);
    this.citySearch()?.clear();
  }

  onCepBlur(): void {
    const cep = this.form.controls.zip_code.value ?? '';
    const cleaned = cep.replace(/\D/g, '');

    if (cleaned.length !== 8) return;

    this.isFetchingCep.set(true);

    this.viaCepService.search(cleaned)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isFetchingCep.set(false);

        if (!result) return;

        if (result.logradouro) {
          this.form.controls.street.setValue(result.logradouro);
        }
        if (result.bairro) {
          this.form.controls.neighborhood.setValue(result.bairro);
        }

        this.form.controls.zip_code.setValue(
          cleaned.replace(/(\d{5})(\d{3})/, '$1-$2'),
        );

        const ibgeCode = parseInt(result.ibge, 10);

        this.locationService.getCity(ibgeCode)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((cityWithState) => {
            this.form.controls.state_id.setValue(cityWithState.state.id);
            this.form.controls.city_id.setValue(cityWithState.id);
            setTimeout(() => this.citySearch()?.setDisplayName(cityWithState.name), 100);
          });
      });
  }

  addLink(): void {
    this.linksArray.push(
      this.fb.group({
        label: ['', Validators.required],
        url: ['', Validators.required],
      }),
    );
  }

  removeLink(index: number): void {
    this.linksArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.canSave) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const data = this.form.getRawValue();

    this.profileService.update({
      handle: data.handle || undefined,
      company_name: data.company_name || undefined,
      cnpj: data.cnpj || undefined,
      description: data.description || undefined,
      logo_url: data.logo_url || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      size: data.size || undefined,
      city_id: data.city_id || undefined,
      zip_code: data.zip_code || undefined,
      street: data.street || undefined,
      neighborhood: data.neighborhood || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      links: data.links?.length ? data.links as { label: string; url: string }[] : undefined,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success('Perfil atualizado com sucesso!');
      },
      error: (err: ApiError) => {
        this.isSaving.set(false);
        this.notify.error(extractErrorMessage(err));
      },
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    const profile = this.profileService.currentProfile();

    if (profile) {
      this.patchForm(profile);
      this.isLoading.set(false);
    } else {
      this.profileService.loadProfile()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const p = this.profileService.currentProfile();
          if (p) this.patchForm(p);
          this.isLoading.set(false);
        });
    }
  }

  private patchForm(profile: CompanyProfile): void {
    this.form.patchValue({
      handle: profile.handle,
      company_name: profile.company_name,
      cnpj: profile.cnpj,
      description: profile.description,
      logo_url: profile.logo_url ?? '',
      website: profile.website ?? '',
      industry: profile.industry,
      size: profile.size,
      city_id: profile.city_id,
      zip_code: profile.zip_code ?? '',
      street: profile.street ?? '',
      neighborhood: profile.neighborhood ?? '',
      number: profile.number ?? '',
      complement: profile.complement ?? '',
    });

    if (profile.city_id) {
      this.loadCityState(profile.city_id);
    }

    this.linksArray.clear();
    if (profile.links?.length) {
      for (const link of profile.links) {
        this.linksArray.push(
          this.fb.group({
            label: [link.label, Validators.required],
            url: [link.url, Validators.required],
          }),
        );
      }
    }

    this.handleAvailable.set(true);
  }

  private loadStates(): Promise<void> {
    return new Promise((resolve) => {
      this.locationService.getStates()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((states) => {
          this.states.set(states);
          resolve();
        });
    });
  }

  private loadCityState(cityId: number): void {
    this.locationService.getCity(cityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cityWithState) => {
        this.form.controls.state_id.setValue(cityWithState.state.id);
        this.form.controls.city_id.setValue(cityWithState.id);
        setTimeout(() => this.citySearch()?.setDisplayName(cityWithState.name), 100);
      });
  }
}
