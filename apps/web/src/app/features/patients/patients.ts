import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Patient, PatientInput } from '../../core/models/models';

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/patients`;

  list(search = '') {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<Patient[]>(this.url, { params });
  }

  get(id: number) {
    return this.http.get<Patient>(`${this.url}/${id}`);
  }

  create(body: PatientInput) {
    return this.http.post<Patient>(this.url, body);
  }

  update(id: number, body: Partial<PatientInput>) {
    return this.http.patch<Patient>(`${this.url}/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
