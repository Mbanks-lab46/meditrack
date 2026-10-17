import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { notInPast } from '../../../validators/time-date.validator';
import { FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsService } from '../appointments';
import { PatientsService } from '../../patients/patients';
import { Patient } from '../../../core/models/models';

function toLocalInput(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 6000).toISOString().slice(0, 16);
}
@Component({
  selector: 'app-appointment-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss',
})
export class AppointmentForm {
  private apptsApi = inject(AppointmentsService);
  private patientApi = inject(PatientsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly durations = [15, 30, 45, 60];
  readonly minDate = toLocalInput(new Date());
  patients = signal<Patient[]>([]);
  saving = signal(false);
  error = signal<string | null>(null);
  private tomorrowAtNine = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; })();
  private apptsForm = inject(FormBuilder).nonNullable.group({
    patientId: [0, Validators.min(1)],
    schedulerAt: [toLocalInput(this.tomorrowAtNine), [Validators.required, notInPast]],
    durationMinutes: [30],
    providerName: ['', [Validators.required, Validators.maxLength(100)]],
    reason: ['', Validators.maxLength(500)]
  });

  private patientId = toSignal(this.apptsForm.controls.patientId.valueChanges, {
    initialValue: this.apptsForm.controls.patientId.value
  });

  selectedPatient = computed(() => this.patients().find((p) => p.id === this.patientId()) ?? null);

  constructor() {
    this.patientApi.list().subscribe((rows) => this.patients.set(rows));

    const fromQuery = Number(this.route.snapshot.queryParamMap.get('patientId'));
    if (fromQuery) this.apptsForm.controls.patientId.setValue(fromQuery)
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);
    const v = this.apptsForm.getRawValue();
    console.log('rawValues: ', v);

    this.apptsApi.create({
      patientId: v.patientId,
      providerName: v.providerName,
      scheduledAt: v.schedulerAt,
      durationMinutes: v.durationMinutes,
      reason: v.reason
    }).subscribe({
      next: () => this.router.navigate(['/patients', v.patientId]),
      error: (e) => {
        const msg = e.error?.message;
        this.error.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to book appointment.'));
        this.saving.set(false);
      }
    });
  }
}
