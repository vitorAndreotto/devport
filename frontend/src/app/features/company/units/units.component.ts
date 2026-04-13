import { Component, inject, signal, viewChild, OnInit, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CitySearchComponent } from '../../../shared/components/city-search/city-search.component';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';
import { CompanyUnitService } from '../../../core/services/company-unit.service';
import { LocationService } from '../../../core/services/location.service';
import { ViaCepService } from '../../../core/services/viacep.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../core/api/api.service';
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { CompanyUnit } from '../../../core/models/company-unit.model';
import { State } from '../../../core/models/location.model';

@Component({
  selector: 'app-company-units',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, CitySearchComponent, CepMaskDirective],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})
export class CompanyUnitsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly unitService = inject(CompanyUnitService);
  private readonly locationService = inject(LocationService);
  private readonly viaCepService = inject(ViaCepService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notify = inject(NotificationService);

  citySearch = viewChild<CitySearchComponent>('citySearch');

  units = signal<CompanyUnit[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isFetchingCep = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  states = signal<State[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    state_id: [null as number | null],
    city_id: [null as number | null, Validators.required],
    zip_code: ['', Validators.required],
    street: ['', [Validators.required, Validators.maxLength(255)]],
    neighborhood: ['', [Validators.required, Validators.maxLength(255)]],
    number: ['', [Validators.required, Validators.maxLength(20)]],
    complement: [''],
  });

  ngOnInit(): void {
    this.loadStates();
    this.loadUnits();
  }

  openNew(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(unit: CompanyUnit): void {
    this.editingId.set(unit.id);
    this.form.patchValue({
      name: unit.name,
      city_id: unit.city_id,
      zip_code: unit.zip_code,
      street: unit.street,
      neighborhood: unit.neighborhood,
      number: unit.number,
      complement: unit.complement ?? '',
    });

    if (unit.city_id) {
      this.locationService.getCity(unit.city_id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cityWithState) => {
          this.form.controls.state_id.setValue(cityWithState.state.id);
          this.form.controls.city_id.setValue(cityWithState.id);
          setTimeout(() => this.citySearch()?.setDisplayName(cityWithState.name), 100);
        });
    }

    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset();
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

        if (result.logradouro) this.form.controls.street.setValue(result.logradouro);
        if (result.bairro) this.form.controls.neighborhood.setValue(result.bairro);

        this.form.controls.zip_code.setValue(cleaned.replace(/(\d{5})(\d{3})/, '$1-$2'));

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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data = this.form.getRawValue();

    const payload = {
      name: data.name!,
      city_id: data.city_id!,
      zip_code: data.zip_code!,
      street: data.street!,
      neighborhood: data.neighborhood!,
      number: data.number!,
      complement: data.complement || undefined,
    };

    const obs = this.editingId()
      ? this.unitService.update(this.editingId()!, payload)
      : this.unitService.create(payload);

    obs.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success(this.editingId() ? 'Unidade atualizada!' : 'Unidade adicionada!');
        this.cancelForm();
        this.loadUnits();
      },
      error: (err: ApiError) => {
        this.isSaving.set(false);
        this.notify.error(extractErrorMessage(err));
      },
    });
  }

  removeUnit(unit: CompanyUnit): void {
    this.unitService.remove(unit.id).subscribe({
      next: () => {
        this.notify.success('Unidade removida.');
        this.loadUnits();
      },
      error: (err: ApiError) => {
        this.notify.error(extractErrorMessage(err));
      },
    });
  }

  private loadUnits(): void {
    this.isLoading.set(true);
    this.unitService.getUnits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (units) => {
          this.units.set(units);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private loadStates(): void {
    this.locationService.getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((states) => this.states.set(states));
  }
}
