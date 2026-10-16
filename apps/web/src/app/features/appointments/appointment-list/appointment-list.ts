import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentsService } from '../appointments';
import { Appointment, AppointmentStatus } from '../../../core/models/models';

type View = 'today' | 'upcoming' | 'past' | 'all';

@Component({
  selector: 'app-appointment-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
})
export class AppointmentList {
  private api = inject(AppointmentsService);

  readonly views: { key: View; label: string }[] = [
    { key: 'today', label: 'Today'},
    { key: 'upcoming', label: 'Upcoming'},
    { key: 'all', label: 'All'},
    { key: 'past', label: 'Past'}
  ]

  appointments = signal<Appointment[]>([]);
  view = signal<View>('upcoming');
  loading = signal(true);
  error = signal<string | null>(null);

  private filtered = computed(() => {
    const now = Date.now();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = start.getTime() + 24 * 60 * 60 * 1000;
    const time = (a: Appointment) => new Date(a.scheduledAt).getTime();
    const list = this.appointments();

    switch (this.view()) {
      case 'today': return list.filter((a) => time(a) >= start.getTime() && time(a) < end);
      case 'upcoming': return list.filter((a) => time(a) >= now && a.status === 'scheduled');
      case 'past': return list.filter((a) => time(a) < now).reverse(); //returns newest past apts first
      default: return list;
    }
  });

  groups = computed(() => {
    const todayKey = new Date().toDateString();
    const byDay = new Map<string, Appointment[]>();
    for (const a of this.filtered()) {
      const key = new Date(a.scheduledAt).toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(a);
    }

    return [...byDay].map(([key, items]) => ({ key, date: new Date(key), isToday: key === todayKey, items}));
  });

  counts = computed(() => {
    const now = Date.now();
    const todayKey = new Date().toDateString();
    const list = this.appointments();
    return {
      today: list.filter((a) => new Date(a.scheduledAt).toDateString() === todayKey).length,
      upcoming: list.filter((a) => a.status === 'scheduled' && new Date(a.scheduledAt).getTime() >= now).length 
    };
  });

  constructor() {
    this.api.list().subscribe({
      next: (rows) => { 
        this.appointments.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load appointments.');
        this.loading.set(false);
      }
    });
  }

  changeStatus(a: Appointment, status: AppointmentStatus) {
    this.api.update(a.id, { status }).subscribe(() => {
      this.appointments.update((list) => list.map((x) => (x.id === a.id ? {...x, status} : x)))
    });
  }
}
