import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientsService } from '../patients';
import { Patient } from '../../../core/models/models';

@Component({
  selector: 'app-patient-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientList {
  private api = inject(PatientsService);
  patients = signal<Patient[]>([]);
  search = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
  }

  onSearch(value: string) {
    this.search.set(value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.load(), 300); // debounce typing
  }

  load() {
    this.loading.set(true);
    this.api.list(this.search()).subscribe({
      next: (rows) => {
        this.patients.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load patients.');
        this.loading.set(false);
      },
    });
  }
}
