import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { State, City } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiService);

  getStates(): Observable<State[]> {
    return this.api.get<{ data: State[] }>('/locations/states').pipe(
      map((res) => res.data),
    );
  }

  getCity(cityId: number): Observable<City & { state: State }> {
    return this.api.get<{ data: City & { state: State } }>(`/locations/cities/${cityId}`).pipe(
      map((res) => res.data),
    );
  }

  searchCities(query: string): Observable<(City & { state: State })[]> {
    return this.api.get<{ data: (City & { state: State })[] }>(`/locations/cities?q=${encodeURIComponent(query)}`).pipe(
      map((res) => res.data),
    );
  }

  getCities(stateId: number, query?: string): Observable<City[]> {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.api.get<{ data: City[] }>(`/locations/states/${stateId}/cities${params}`).pipe(
      map((res) => res.data),
    );
  }
}
