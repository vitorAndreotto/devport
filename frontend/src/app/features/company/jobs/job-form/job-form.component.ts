import { Component, inject, signal, viewChild, OnInit, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { CitySearchComponent } from '../../../../shared/components/city-search/city-search.component';
import { CepMaskDirective } from '../../../../shared/directives/cep-mask.directive';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { JobService } from '../../../../core/services/job.service';
import { CompanyUnitService } from '../../../../core/services/company-unit.service';
import { CompanyProfileService } from '../../../../core/services/company-profile.service';
import { LocationService } from '../../../../core/services/location.service';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../core/api/api.service';
import { extractErrorMessage } from '../../../../core/api/api-error.util';
import { Job } from '../../../../core/models/job.model';
import { CompanyUnit } from '../../../../core/models/company-unit.model';
import { State } from '../../../../core/models/location.model';
import { SkillTree } from '../../../../core/models/skill.model';
import { SkillService } from '../../../../core/services/skill.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormFieldComponent, CitySearchComponent, CepMaskDirective, CurrencyMaskDirective],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss',
})
export class JobFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jobService = inject(JobService);
  private readonly unitService = inject(CompanyUnitService);
  private readonly profileService = inject(CompanyProfileService);
  private readonly skillService = inject(SkillService);
  private readonly locationService = inject(LocationService);
  private readonly viaCepService = inject(ViaCepService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  citySearch = viewChild<CitySearchComponent>('citySearch');

  isLoading = signal(false);
  isSaving = signal(false);
  isFetchingCep = signal(false);
  editingJob = signal<Job | null>(null);
  units = signal<CompanyUnit[]>([]);
  states = signal<State[]>([]);
  availableSkills = signal<SkillTree[]>([]);
  benefitInput = signal('');

  get isEditing(): boolean {
    return this.editingJob() !== null;
  }

  get pageTitle(): string {
    return this.isEditing ? 'Editar Rota' : 'Nova Rota';
  }

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.required],
    seniority: ['', Validators.required],
    min_experience_years: [0, [Validators.required, Validators.min(0)]],
    contract_model: ['', Validators.required],
    salary_clt_min: [''],
    salary_clt_max: [''],
    salary_pj_min: [''],
    salary_pj_max: [''],
    show_salary: [false],
    max_radius_km: [null as number | null],
    work_mode: ['', Validators.required],
    company_unit_id: ['' as string],
    // Address
    state_id: [null as number | null],
    city_id: [null as number | null],
    zip_code: [''],
    street: [''],
    neighborhood: [''],
    number: [''],
    complement: [''],
    // Skills & Benefits
    skills: this.fb.array([] as FormGroup[]),
    benefits: this.fb.array([] as FormGroup[]),
  });

  private salaryRangeValidator() {
    return (group: any) => {
      const parse = (v: any) => {
        if (!v) return null;
        const cleaned = String(v).replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) || num === 0 ? null : num;
      };
      const cMin = parse(group.get('salary_clt_min')?.value);
      const cMax = parse(group.get('salary_clt_max')?.value);
      const pMin = parse(group.get('salary_pj_min')?.value);
      const pMax = parse(group.get('salary_pj_max')?.value);

      const errors: any = {};
      if (cMin != null && cMax != null && cMax < cMin) errors.cltRange = true;
      if (pMin != null && pMax != null && pMax < pMin) errors.pjRange = true;
      if ((cMin != null) !== (cMax != null)) errors.cltIncomplete = true;
      if ((pMin != null) !== (pMax != null)) errors.pjIncomplete = true;
      return Object.keys(errors).length ? errors : null;
    };
  }

  hasSalaryError(key: string): boolean {
    return !!this.form.errors?.[key];
  }

  get skillsArray(): FormArray<FormGroup> {
    return this.form.controls.skills;
  }

  get benefitsArray(): FormArray<FormGroup> {
    return this.form.controls.benefits;
  }

  get needsAddress(): boolean {
    const mode = this.form.controls.work_mode.value;
    return mode === 'onsite' || mode === 'hybrid';
  }

  ngOnInit(): void {
    this.form.addValidators(this.salaryRangeValidator());
    this.form.updateValueAndValidity({ emitEvent: false });

    this.loadStates();
    this.loadUnits();
    this.loadSkills();

    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJob(jobId);
    }
  }

  onLocationSourceChange(): void {
    const unitId = this.form.controls.company_unit_id.value;

    if (unitId === '' || unitId === null) {
      // Sede
      const profile = this.profileService.currentProfile();
      if (profile?.city_id) {
        this.fillAddress(profile.city_id, profile.zip_code, profile.street, profile.neighborhood, profile.number, profile.complement);
      }
      return;
    }

    const unit = this.units().find((u) => u.id === unitId);
    if (unit) {
      this.fillAddress(unit.city_id, unit.zip_code, unit.street, unit.neighborhood, unit.number, unit.complement);
    }
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
          .subscribe((c) => {
            this.form.controls.state_id.setValue(c.state.id);
            this.form.controls.city_id.setValue(c.id);
            setTimeout(() => this.citySearch()?.setDisplayName(c.name), 100);
          });
      });
  }

  addSkill(): void {
    this.skillsArray.push(this.fb.group({
      skill_id: ['', Validators.required],
      min_level: ['intermediate', Validators.required],
      requirement: ['required', Validators.required],
    }));
  }

  removeSkill(i: number): void {
    this.skillsArray.removeAt(i);
  }

  addBenefit(): void {
    const val = this.benefitInput().trim();
    if (!val) return;
    this.benefitsArray.push(this.fb.group({ value: [val] }));
    this.benefitInput.set('');
  }

  removeBenefit(i: number): void {
    this.benefitsArray.removeAt(i);
  }

  onBenefitKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addBenefit();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const d = this.form.getRawValue();

    const payload = {
      title: d.title!,
      description: d.description!,
      seniority: d.seniority!,
      skills: d.skills.map((s: any) => ({
        skill_id: s.skill_id,
        min_level: s.min_level,
        requirement: s.requirement,
      })),
      min_experience_years: d.min_experience_years!,
      contract_model: d.contract_model!,
      salary_clt_min: this.parseCurrency(d.salary_clt_min) || undefined,
      salary_clt_max: this.parseCurrency(d.salary_clt_max) || undefined,
      salary_pj_min: this.parseCurrency(d.salary_pj_min) || undefined,
      salary_pj_max: this.parseCurrency(d.salary_pj_max) || undefined,
      max_radius_km: d.max_radius_km || undefined,
      show_salary: d.show_salary ?? false,
      benefits: d.benefits.length ? d.benefits.map((b: any) => b.value) : undefined,
      work_mode: d.work_mode!,
      company_unit_id: d.company_unit_id || undefined,
      city_id: d.city_id || undefined,
      zip_code: d.zip_code || undefined,
      street: d.street || undefined,
      neighborhood: d.neighborhood || undefined,
      number: d.number || undefined,
      complement: d.complement || undefined,
    };

    const obs = this.isEditing
      ? this.jobService.update(this.editingJob()!.id, payload)
      : this.jobService.create(payload);

    obs.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success(this.isEditing ? 'Rota atualizada!' : 'Rota publicada!');
        this.router.navigate(['/company/jobs']);
      },
      error: (err: ApiError) => {
        this.isSaving.set(false);
        this.notify.error(extractErrorMessage(err));
      },
    });
  }

  private loadJob(id: string): void {
    this.isLoading.set(true);
    this.jobService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (job) => {
          this.editingJob.set(job);
          this.patchForm(job);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/company/jobs']);
        },
      });
  }

  private patchForm(job: Job): void {
    this.form.patchValue({
      title: job.title,
      description: job.description,
      seniority: job.seniority,
      min_experience_years: job.min_experience_years,
      contract_model: job.contract_model,
      salary_clt_min: job.salary_clt_min != null ? String(job.salary_clt_min) : '',
      salary_clt_max: job.salary_clt_max != null ? String(job.salary_clt_max) : '',
      salary_pj_min: job.salary_pj_min != null ? String(job.salary_pj_min) : '',
      salary_pj_max: job.salary_pj_max != null ? String(job.salary_pj_max) : '',
      show_salary: job.show_salary,
      work_mode: job.work_mode,
      company_unit_id: job.company_unit_id ?? '',
      city_id: job.city_id,
      zip_code: job.zip_code ?? '',
      street: job.street ?? '',
      neighborhood: job.neighborhood ?? '',
      number: job.number ?? '',
      complement: job.complement ?? '',
    });

    if (job.city_id) {
      this.locationService.getCity(job.city_id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((c) => {
          this.form.controls.state_id.setValue(c.state.id);
          setTimeout(() => this.citySearch()?.setDisplayName(c.name), 100);
        });
    }

    this.skillsArray.clear();
    for (const s of job.skills) {
      this.skillsArray.push(this.fb.group({
        skill_id: [s.skill.id, Validators.required],
        min_level: [s.min_level, Validators.required],
        requirement: [s.requirement, Validators.required],
      }));
    }

    this.benefitsArray.clear();
    if (job.benefits?.length) {
      for (const b of job.benefits) {
        this.benefitsArray.push(this.fb.group({ value: [b] }));
      }
    }
  }

  private fillAddress(cityId: number | null, zipCode: string | null, street: string | null, neighborhood: string | null, num: string | null, complement: string | null): void {
    this.form.patchValue({
      city_id: cityId,
      zip_code: zipCode ?? '',
      street: street ?? '',
      neighborhood: neighborhood ?? '',
      number: num ?? '',
      complement: complement ?? '',
    });

    if (cityId) {
      this.locationService.getCity(cityId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((c) => {
          this.form.controls.state_id.setValue(c.state.id);
          setTimeout(() => this.citySearch()?.setDisplayName(c.name), 100);
        });
    }
  }

  private loadUnits(): void {
    this.unitService.getUnits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((units) => this.units.set(units));
  }

  private loadStates(): void {
    this.locationService.getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((states) => this.states.set(states));
  }

  private loadSkills(): void {
    this.skillService.getSkillTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((skills) => this.availableSkills.set(this.flattenSkills(skills)));
  }

  private flattenSkills(skills: SkillTree[]): SkillTree[] {
    const result: SkillTree[] = [];
    for (const s of skills) {
      result.push(s);
      if (s.children?.length) {
        result.push(...this.flattenSkills(s.children));
      }
    }
    return result;
  }

  private parseCurrency(value: string | null | undefined): number {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
}
