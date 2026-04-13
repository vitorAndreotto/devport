import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CompanyUnit, CreateCompanyUnitPayload, UpdateCompanyUnitPayload } from '../models/company-unit.model';

interface UnitsResponse {
  data: CompanyUnit[];
}

interface UnitResponse {
  data: CompanyUnit;
}

@Injectable({ providedIn: 'root' })
export class CompanyUnitService {
  private readonly api = inject(ApiService);

  getUnits(): Observable<CompanyUnit[]> {
    return new Observable((subscriber) => {
      this.api.get<UnitsResponse>('/company/units').subscribe({
        next: (res) => {
          subscriber.next(res.data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  create(payload: CreateCompanyUnitPayload): Observable<CompanyUnit> {
    return new Observable((subscriber) => {
      this.api.post<UnitResponse>('/company/units', payload).subscribe({
        next: (res) => {
          subscriber.next(res.data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  update(id: string, payload: UpdateCompanyUnitPayload): Observable<CompanyUnit> {
    return new Observable((subscriber) => {
      this.api.put<UnitResponse>(`/company/units/${id}`, payload).subscribe({
        next: (res) => {
          subscriber.next(res.data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  remove(id: string): Observable<void> {
    return this.api.delete(`/company/units/${id}`);
  }
}
