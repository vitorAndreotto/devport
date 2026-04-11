import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DevProfile, CreateDevProfilePayload, UpdateDevProfilePayload, HandleCheckResponse } from '../models/dev-profile.model';

interface DevProfileResponse {
  data: DevProfile;
}

@Injectable({ providedIn: 'root' })
export class DevProfileService {
  private readonly api = inject(ApiService);

  private readonly profile = signal<DevProfile | null>(null);
  private readonly loaded = signal(false);

  readonly currentProfile = this.profile.asReadonly();
  readonly hasProfile = () => this.profile() !== null;
  readonly isLoaded = this.loaded.asReadonly();

  loadProfile(): Observable<DevProfile | null> {
    return this.api.get<DevProfileResponse>('/dev/profile').pipe(
      tap((res) => {
        this.profile.set(res.data);
        this.loaded.set(true);
      }),
      catchError(() => {
        this.profile.set(null);
        this.loaded.set(true);
        return of(null);
      }),
    ) as Observable<DevProfile | null>;
  }

  create(payload: CreateDevProfilePayload): Observable<DevProfileResponse> {
    return this.api.post<DevProfileResponse>('/dev/profile', payload).pipe(
      tap((res) => this.profile.set(res.data)),
    );
  }

  update(payload: UpdateDevProfilePayload): Observable<DevProfileResponse> {
    return this.api.put<DevProfileResponse>('/dev/profile', payload).pipe(
      tap((res) => this.profile.set(res.data)),
    );
  }

  checkHandle(handle: string): Observable<boolean> {
    return this.api.get<HandleCheckResponse>(`/developers/check-handle/${handle}`).pipe(
      map((res) => res.data.available),
      catchError(() => of(false)),
    );
  }

  clearProfile(): void {
    this.profile.set(null);
    this.loaded.set(false);
  }
}
