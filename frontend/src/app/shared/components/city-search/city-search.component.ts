import { Component, inject, input, signal, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { LocationService } from '../../../core/services/location.service';
import { City } from '../../../core/models/location.model';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss',
})
export class CitySearchComponent {
  stateId = input.required<number | null>();
  control = input.required<FormControl<number | null>>();

  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);

  searchText = signal('');
  results = signal<City[]>([]);
  isOpen = signal(false);
  isSearching = signal(false);
  selectedName = signal('');

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        const stateId = this.stateId();
        if (!stateId || query.length < 2) {
          return of([]);
        }
        this.isSearching.set(true);
        return this.locationService.getCities(stateId, query);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((cities) => {
      this.results.set(cities);
      this.isSearching.set(false);
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.isOpen.set(true);
    this.control().setValue(null);
    this.selectedName.set('');
    this.search$.next(value);
  }

  onFocus(): void {
    if (this.results().length > 0) {
      this.isOpen.set(true);
    }
  }

  onBlur(): void {
    // Delay para permitir click no item
    setTimeout(() => this.isOpen.set(false), 200);
  }

  selectCity(city: City): void {
    this.control().setValue(city.id);
    this.selectedName.set(city.name);
    this.searchText.set(city.name);
    this.isOpen.set(false);
    this.results.set([]);
  }

  setDisplayName(name: string): void {
    this.selectedName.set(name);
    this.searchText.set(name);
  }

  clear(): void {
    this.control().setValue(null);
    this.selectedName.set('');
    this.searchText.set('');
    this.results.set([]);
  }
}
