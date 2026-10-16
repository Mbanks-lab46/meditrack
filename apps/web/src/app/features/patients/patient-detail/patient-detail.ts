import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink} from '@angular/router';
import { PatientsService } from '../patients';
import { Patient } from '../../../core/models/models';

type Tab = 'upcoming' | 'past';
const AVATAR_COLORS = ['#cdeee0', '#dbe7ff', '#fde8cf', '#f3dcf5', '#d9f2f7'];

@Component({
  selector: 'app-patient-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.scss',
})
export class PatientDetail implements OnInit {
  readonly id = input.required<string>();
  private api = inject(PatientsService);
  private router = inject(Router);
  private readonly now = Date.now();
  patient = signal<Patient | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  tab = signal<Tab>('upcoming');

   // Derived values: recalculates automatically when patient() changes
  initials = computed(() => {
    const p = this.patient();
    return p ? (p.firstName[0] + p.lastName[0]).toUpperCase() : '';
  });

  avatarColor = computed(() => {
    const p = this.patient();
    if (!p) return AVATAR_COLORS[0];
    const sum = [...(p.firstName + p.lastName)].reduce((s, c) => s + c.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length]; // same patient always gets the same color
  });

  mrn = computed(() => String(this.patient()?.id ?? '').padStart(6, '0'));

  age = computed(() => {
    const dob = this.patient()?.dateOfBirth;
    if (!dob) return null;
    const [y, m, d] = dob.slice(0, 10).split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
    return age;
  });

  private appointments = computed(() => this.patient()?.appointments ?? []);

  upcoming = computed(() =>
    this.appointments()
      .filter((a) => a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= this.now)
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
  );

  past = computed(() =>
    this.appointments()
      .filter((a) => !this.upcoming().includes(a))
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
  );

  next = computed(() => this.upcoming()[0] ?? null);
  completedCount = computed(() => this.appointments().filter((a) => a.status === 'completed').length);
  lastVisit = computed(() => this.past().find((a) => a.status === 'completed') ?? null);
  visible = computed(() => (this.tab() === 'upcoming' ? this.upcoming() : this.past()));

  ngOnInit() {
    this.api.get(+this.id()).subscribe({
      next: (p) => { this.patient.set(p); this.loading.set(false); },
      error: (e) => {
        this.error.set(e.status === 404 ? 'Patient not found.' : 'Could not load this patient.');
        this.loading.set(false);
      },
    });
  }

  remove(p: Patient) {
    if (!confirm(`Delete ${p.firstName} ${p.lastName} and all their appointments? This cannot be undone.`)) return;
    this.api.remove(p.id).subscribe(() => this.router.navigate(['/patients']));
  }


}
