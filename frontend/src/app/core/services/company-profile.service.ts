import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CompanyProfile, CreateCompanyProfilePayload, UpdateCompanyProfilePayload } from '../models/company-profile.model';
import { HandleCheckResponse } from '../models/dev-profile.model';

interface CompanyProfileResponse {
  data: CompanyProfile;
}

@Injectable({ providedIn: 'root' })
export class CompanyProfileService {
  private readonly api = inject(ApiService);

  private readonly profile = signal<CompanyProfile | null>(null);
  private readonly loaded = signal(false);

  readonly currentProfile = this.profile.asReadonly();
  readonly hasProfile = () => this.profile() !== null;
  readonly isLoaded = this.loaded.asReadonly();

  loadProfile(): Observable<CompanyProfile | null> {
    return this.api.get<CompanyProfileResponse>('/company/profile').pipe(
      tap((res) => {
        this.profile.set(res.data);
        this.loaded.set(true);
      }),
      catchError(() => {
        this.profile.set(null);
        this.loaded.set(true);
        return of(null);
      }),
    ) as Observable<CompanyProfile | null>;
  }

  create(payload: CreateCompanyProfilePayload): Observable<CompanyProfileResponse> {
    return this.api.post<CompanyProfileResponse>('/company/profile', payload).pipe(
      tap((res) => this.profile.set(res.data)),
    );
  }

  update(payload: UpdateCompanyProfilePayload): Observable<CompanyProfileResponse> {
    return this.api.put<CompanyProfileResponse>('/company/profile', payload).pipe(
      tap((res) => this.profile.set(res.data)),
    );
  }

  checkHandle(handle: string): Observable<boolean> {
    return this.api.get<HandleCheckResponse>(`/companies/check-handle/${handle}`).pipe(
      map((res) => res.data.available),
      catchError(() => of(false)),
    );
  }

  clearProfile(): void {
    this.profile.set(null);
    this.loaded.set(false);
  }
}
