export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  phone?: string;
  email?: string;
  appointments?: Appointment[];
}

export type PatientInput = Omit<Patient, 'id' | 'appointments'>;

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  providerName: string;
  scheduledAt: string;
  durationMinutes: number;
  reason?: string;
  status: AppointmentStatus;
  patient?: Patient;
}

export type AppointmentInput = Omit<Appointment, 'id' | 'patient'>;
