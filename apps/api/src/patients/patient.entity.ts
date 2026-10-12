import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity({ name: 'Patients' })
export class Patient {
  @PrimaryGeneratedColumn({ name: 'Id' }) id!: number;
  @Column({ name: 'FirstName ', length: 100 }) firstName!: string;
  @Column({ name: 'LastName', length: 100 }) lastName!: string;
  @Column({ name: 'DateOfBirth', type: 'date' }) dateOfBirth!: string;
  @Column({ name: 'Gender', length: 20, nullable: true }) gender?: string;
  @Column({ name: 'Phone', length: 30, nullable: true }) phone?: string;
  @Column({ name: 'Email', length: 256, nullable: true }) email?: string;
  @OneToMany(() => Appointment, (a) => a.patient) appointments?: Appointment[];
  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'UpdatedAt', type: 'datetime2' }) updatedAt!: Date;
}
