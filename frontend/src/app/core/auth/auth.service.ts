import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthResponse, LoginPayload, RegisterPayload, User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUser = signal<User | null>(null);
  private readonly accessToken = signal<string | null>(null);
  private readonly refreshTokenValue = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor() {
    this.loadFromStorage();
  }

  register(payload: RegisterPayload, role: UserRole): Observable<AuthResponse> {
    const endpoint = role === 'dev' ? '/auth/register/dev' : '/auth/register/company';

    return this.api.post<AuthResponse>(endpoint, payload).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  logout(): void {
    const token = this.accessToken();
    if (token) {
      this.api.post('/auth/logout', {}).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private setSession(res: AuthResponse): void {
    this.currentUser.set(res.data.user);
    this.accessToken.set(res.data.access_token);
    this.refreshTokenValue.set(res.data.refresh_token);

    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    this.refreshTokenValue.set(null);

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      this.accessToken.set(token);
      this.refreshTokenValue.set(refresh);
      this.currentUser.set(JSON.parse(userJson));
    }
  }
}
