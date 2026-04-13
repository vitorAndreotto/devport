import { Component, inject, signal, viewChild, OnInit, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { HandleInputComponent, HandleStatus } from '../../../shared/components/handle-input/handle-input.component';
import { CitySearchComponent } from '../../../shared/components/city-search/city-search.component';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';
import { CurrencyMaskDirective } from '../../../shared/directives/currency-mask.directive';
import { DevProfileService } from '../../../core/services/dev-profile.service';
import { LocationService } from '../../../core/services/location.service';
import { ViaCepService } from '../../../core/services/viacep.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { State } from '../../../core/models/location.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, HandleInputComponent, CitySearchComponent, CepMaskDirective, CurrencyMaskDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(DevProfileService);
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

  form = this.fb.group({
    handle: [''],
    full_name: ['', [Validators.required, Validators.maxLength(255)]],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    bio: ['', [Validators.required, Validators.maxLength(500)]],
    avatar_url: [''],
    email_contact: ['', [Validators.required, Validators.email]],
    state_id: [null as number | null],
    city_id: [null as number | null],
    zip_code: [''],
    street: [''],
    neighborhood: [''],
    number: [''],
    complement: [''],
    work_mode_remote: [false],
    work_mode_hybrid: [false],
    work_mode_onsite: [false],
    employment_status: [null as string | null],
    salary_min: [''],
    salary_max: [''],
    github_username: [''],
    links: this.fb.array([] as FormGroup[]),
  });

  get linksArray(): FormArray<FormGroup> {
    return this.form.controls.links;
  }

  get bioLength(): number {
    return this.form.controls.bio.value?.length ?? 0;
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

        // Preenche rua e bairro
        if (result.logradouro) {
          this.form.controls.street.setValue(result.logradouro);
        }
        if (result.bairro) {
          this.form.controls.neighborhood.setValue(result.bairro);
        }

        // Formata o CEP
        this.form.controls.zip_code.setValue(
          cleaned.replace(/(\d{5})(\d{3})/, '$1-$2'),
        );

        // Busca cidade diretamente pelo código IBGE
        const ibgeCode = parseInt(result.ibge, 10);

        this.locationService.getCity(ibgeCode)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((cityWithState) => {
            this.form.controls.state_id.setValue(cityWithState.state.id);
            this.form.controls.city_id.setValue(cityWithState.id);
            // Aguarda o Angular re-render com novo stateId antes de setar o nome
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
      full_name: data.full_name || undefined,
      title: data.title || undefined,
      bio: data.bio || undefined,
      avatar_url: data.avatar_url || undefined,
      email_contact: data.email_contact || undefined,
      city_id: data.city_id || undefined,
      zip_code: data.zip_code || undefined,
      street: data.street || undefined,
      neighborhood: data.neighborhood || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      work_modes: this.buildWorkModes(),
      employment_status: data.employment_status || undefined,
      salary_min: this.parseCurrency(data.salary_min) ?? undefined,
      salary_max: this.parseCurrency(data.salary_max) ?? undefined,
      github_username: data.github_username || undefined,
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

  private patchForm(profile: import('../../../core/models/dev-profile.model').DevProfile): void {
    this.form.patchValue({
      handle: profile.handle,
      full_name: profile.full_name,
      title: profile.title,
      bio: profile.bio,
      avatar_url: profile.avatar_url ?? '',
      email_contact: profile.email_contact,
      city_id: profile.city_id,
      zip_code: profile.zip_code ?? '',
      street: profile.street ?? '',
      neighborhood: profile.neighborhood ?? '',
      number: profile.number ?? '',
      complement: profile.complement ?? '',
      work_mode_remote: profile.work_modes?.includes('remote') ?? false,
      work_mode_hybrid: profile.work_modes?.includes('hybrid') ?? false,
      work_mode_onsite: profile.work_modes?.includes('onsite') ?? false,
      employment_status: profile.employment_status,
      salary_min: profile.salary_min != null ? String(profile.salary_min) : '',
      salary_max: profile.salary_max != null ? String(profile.salary_max) : '',
      github_username: profile.github_username ?? '',
    });

    // Load state from city
    if (profile.city_id) {
      this.loadCityState(profile.city_id);
    }

    // Populate links
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

    // Mark handle as valid (it's the current one)
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

  private buildWorkModes(): string[] | undefined {
    const modes: string[] = [];
    const d = this.form.getRawValue();
    if (d.work_mode_remote) modes.push('remote');
    if (d.work_mode_hybrid) modes.push('hybrid');
    if (d.work_mode_onsite) modes.push('onsite');
    return modes.length > 0 ? modes : undefined;
  }

  private parseCurrency(value: string | null | undefined): number | null {
    if (!value) return null;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private loadCityState(cityId: number): void {
    this.locationService.getCity(cityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cityWithState) => {
        this.form.controls.state_id.setValue(cityWithState.state.id);
        this.form.controls.city_id.setValue(cityWithState.id);
        // ViewChild precisa de um tick para existir após state_id mudar
        setTimeout(() => this.citySearch()?.setDisplayName(cityWithState.name), 100);
      });
  }
}
