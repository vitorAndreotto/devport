import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProfileTabComponent } from './tabs/profile-tab/profile-tab.component';
import { SkillsTabComponent } from './tabs/skills-tab/skills-tab.component';
import { JobsTabComponent } from './tabs/jobs-tab/jobs-tab.component';

type TabId = 'profile' | 'skills' | 'jobs';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [LucideAngularModule, ProfileTabComponent, SkillsTabComponent, JobsTabComponent],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.scss',
})
export class DashboardsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  activeTab = signal<TabId>('profile');
  loadedTabs = signal<Set<TabId>>(new Set(['profile']));

  readonly tabs: Tab[] = [
    { id: 'profile', label: 'Perfil', icon: 'user', description: 'Salário, localização, modalidade e experiência' },
    { id: 'skills', label: 'Skills', icon: 'puzzle', description: 'Suas skills vs mercado e devs' },
    { id: 'jobs', label: 'Vagas', icon: 'compass', description: 'Score de match por senioridade' },
  ];

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const tab = params['tab'] as TabId | undefined;
        if (tab && this.tabs.some((t) => t.id === tab)) {
          this.activate(tab);
        }
      });
  }

  activate(tab: TabId): void {
    this.activeTab.set(tab);
    this.loadedTabs.update((s) => {
      const next = new Set(s);
      next.add(tab);
      return next;
    });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  isLoaded(tab: TabId): boolean {
    return this.loadedTabs().has(tab);
  }
}
