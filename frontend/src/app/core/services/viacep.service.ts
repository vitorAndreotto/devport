import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ViaCepService {
  private readonly http = inject(HttpClient);

  search(cep: string): Observable<ViaCepResponse | null> {
    const cleaned = cep.replace(/\D/g, '');

    if (cleaned.length !== 8) {
      return of(null);
    }

    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleaned}/json/`).pipe(
      map((res) => (res.erro ? null : res)),
      catchError(() => of(null)),
    );
  }
}
