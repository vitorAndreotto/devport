import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import {
  DevIndicatorService,
  SalaryAvgRow,
  WorkModeRow,
  ContractRow,
  SeniorityRow,
  ProfileCompleteness,
  TopCityRow,
  JobsMapCityRow,
} from '../../../../../core/services/dev-indicator.service';
import { DevProfileService } from '../../../../../core/services/dev-profile.service';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [LucideAngularModule, LeafletModule],
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss',
})
export class ProfileTabComponent implements OnInit {
  private readonly indicatorService = inject(DevIndicatorService);
  private readonly profileService = inject(DevProfileService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  salaryAvgBySeniority = signal<SalaryAvgRow[]>([]);
  workModeDistribution = signal<WorkModeRow[]>([]);
  contractDistribution = signal<ContractRow[]>([]);
  seniorityDistribution = signal<SeniorityRow[]>([]);
  profileCompleteness = signal<ProfileCompleteness | null>(null);
  topCities = signal<TopCityRow[]>([]);
  jobsMap = signal<JobsMapCityRow[]>([]);

  profile = computed(() => this.profileService.currentProfile());

  // Personal salary band
  hasSalary = computed(() => {
    const p = this.profile();
    return !!(p?.salary_clt_min || p?.salary_pj_min);
  });

  readonly seniorityLabels: Record<string, string> = {
    intern: 'Estágio',
    junior: 'Júnior',
    mid: 'Pleno',
    senior: 'Sênior',
    lead: 'Lead',
    specialist: 'Especialista',
  };

  readonly workModeLabels: Record<string, string> = {
    remote: 'Remoto',
    hybrid: 'Híbrido',
    onsite: 'Presencial',
  };

  ngOnInit(): void {
    this.indicatorService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.salaryAvgBySeniority.set(data.general.salary_avg_by_seniority);
          this.workModeDistribution.set(data.general.work_mode_distribution);
          this.contractDistribution.set(data.general.contract_distribution ?? []);
          this.seniorityDistribution.set(data.general.seniority_distribution ?? []);
          this.jobsMap.set(data.general.jobs_map ?? []);
          this.profileCompleteness.set(data.personal.profile_completeness);
          this.topCities.set(data.personal.top_cities ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  formatBRL(v: number | null | undefined): string {
    if (v == null) return '-';
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  getCompletenessColor(score: number): string {
    if (score >= 80) return 'var(--green-500, #22c55e)';
    if (score >= 50) return 'var(--amber-500, #f59e0b)';
    return 'var(--red-500, #ef4444)';
  }

  // Pie chart helpers
  readonly pieColors: Record<string, string> = {
    // work modes
    remote: '#1e3a5f',
    hybrid: '#3b82f6',
    onsite: '#93c5fd',
    // contract models
    clt: '#1e3a5f',
    pj: '#3b82f6',
    clt_pj: '#93c5fd',
    // seniorities
    intern: '#cbd5e1',
    junior: '#93c5fd',
    mid: '#3b82f6',
    senior: '#1e3a5f',
    lead: '#0f172a',
    specialist: '#7c3aed',
  };

  readonly contractLabels: Record<string, string> = {
    clt: 'CLT',
    pj: 'PJ',
    clt_pj: 'CLT/PJ',
  };

  modePieSlices = computed(() => this.buildSlices(
    this.workModeDistribution(),
    (i) => i.work_mode,
    (i) => this.workModeLabels[i.work_mode] || i.work_mode,
  ));

  contractPieSlices = computed(() => this.buildSlices(
    this.contractDistribution(),
    (i) => i.contract_model,
    (i) => this.contractLabels[i.contract_model] || i.contract_model,
  ));

  seniorityPieSlices = computed(() => this.buildSlices(
    this.seniorityDistribution(),
    (i) => i.seniority,
    (i) => this.seniorityLabels[i.seniority] || i.seniority,
    (i) => `${i.avg_experience_years.toFixed(1).replace('.0', '')}+ anos`,
  ));

  // ============================================================
  // Mapa do Brasil — Leaflet com circle markers
  // ============================================================

  readonly maxCircleRadius = 24;
  readonly minCircleRadius = 4;

  // Bounding box do Brasil pra fit inicial
  readonly brazilBounds: L.LatLngBoundsLiteral = [
    [-33.75, -73.99],
    [5.27, -34.79],
  ];

  // Opcoes do mapa (Leaflet)
  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap',
      }),
    ],
    zoom: 4,
    center: L.latLng(-14.235, -51.9253), // centroide aproximado do Brasil
    minZoom: 3,
    maxZoom: 12,
    scrollWheelZoom: false, // evita scroll-jacking dentro do dashboard
    attributionControl: true,
  };

  // Layers de circulos — recomputado quando jobsMap muda
  jobLayers = computed<L.Layer[]>(() => {
    const cities = this.jobsMap();
    if (cities.length === 0) return [];
    const maxCount = Math.max(...cities.map((c) => c.job_count));
    return cities.map((c) => {
      const ratio = Math.sqrt(c.job_count / maxCount);
      const radius = Math.max(this.minCircleRadius, ratio * this.maxCircleRadius);
      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius,
        color: '#1e3a5f',
        weight: 1,
        opacity: 0.7,
        fillColor: '#2d4a6b',
        fillOpacity: 0.5,
      });
      marker.bindTooltip(
        `<strong>${c.name} - ${c.state_abbr}</strong><br>${c.job_count} vaga${c.job_count !== 1 ? 's' : ''}`,
        { direction: 'top', offset: [0, -radius] },
      );
      return marker;
    });
  });

  onMapReady(map: L.Map): void {
    // Faz fit ao bbox do Brasil
    map.fitBounds(this.brazilBounds, { padding: [20, 20] });
  }

  private buildSlices<T extends { pct: number }>(
    items: T[],
    keyFn: (item: T) => string,
    labelFn: (item: T) => string,
    sublabelFn?: (item: T) => string,
  ) {
    if (items.length === 0) return [];

    const cx = 100, cy = 100, r = 80;
    let cumulative = 0;

    return items.map((item) => {
      const key = keyFn(item);
      const color = this.pieColors[key] || '#94a3b8';
      const label = labelFn(item);
      const sublabel = sublabelFn ? sublabelFn(item) : null;
      const pct = Number(item.pct) / 100;
      const startAngle = cumulative * 2 * Math.PI;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI;

      if (items.length === 1 || pct >= 0.999) {
        return {
          path: `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`,
          color, label, sublabel, pct: Number(item.pct), key,
        };
      }

      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

      return {
        path: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
        color, label, sublabel, pct: Number(item.pct), key,
      };
    });
  }
}
