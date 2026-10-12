import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'Id' }) id!: number;
  @Column({ name: 'Email', length: 256, unique: true }) email!: string;
  @Column({ name: 'PasswordHash', length: 255 }) passwordHash!: string;
  @Column({ name: 'FullName', length: 100 }) fullName!: string;
  @Column({ name: 'Role', length: 20, default: 'staff' }) role!:
    'admin' | 'staff';
  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' }) createdAt!: Date;
}
