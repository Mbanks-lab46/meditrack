import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

@Entity({ name: 'Appointments' })
@Index('IX_Appointments_PatientId_ScheduledAt', ['patientId', 'scheduledAt'])
export class Appointment {
  @PrimaryGeneratedColumn({ name: 'Id' }) id!: number;
  @Column({ name: 'PatientId' }) patientId!: number;
  @ManyToOne(() => Patient, (p) => p.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PatientId' })
  patient?: Patient;
  @Column({ name: 'ProviderName', length: 100 }) providerName!: string;
  @Column({ name: 'ScheduledAt', type: 'datetime2' }) scheduledAt!: Date;
  @Column({ name: 'DurationMinutes', default: 30 }) durationMinutes!: number;
  @Column({ name: 'Reason', length: 500, nullable: true }) reason?: string;
  @Column({ name: 'Status', length: 20, default: 'scheduled' })
  status!: AppointmentStatus;
  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' }) createdAt!: Date;
}
