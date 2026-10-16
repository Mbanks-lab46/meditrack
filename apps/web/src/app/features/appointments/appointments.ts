import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentInput } from '../../core/models/models';
import { Observable } from 'rxjs';

export interface ApptFilter {
  patientId?: number;
  from?: string;
  to?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/appointments`;

  list(filter: ApptFilter = {}): Observable<Appointment[]> {
    let params = new HttpParams();
    if (filter.patientId) params = params.set('patientId', filter.patientId);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    return this.http.get<Appointment[]>(this.baseUrl, { params })
  }

  get(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/${id}`);
  }

  create(body: Omit<AppointmentInput, 'status'>): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, body);
  }

  update(id: number, body: Partial<AppointmentInput>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
