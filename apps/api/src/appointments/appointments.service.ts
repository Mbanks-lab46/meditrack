import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { PatientsService } from '../patients/patients.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly patients: PatientsService,
  ) {}

  findAll(filter: { patientId?: number; from?: string; to?: string }) {
    const where: FindOptionsWhere<Appointment> = {};
    if (filter.patientId) where.patientId = filter.patientId;
    if (filter.from && filter.to)
      where.scheduledAt = Between(new Date(filter.from), new Date(filter.to));
    return this.repo.find({
      where,
      relations: { patient: true },
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: number) {
    const appt = await this.repo.findOne({
      where: { id },
      relations: { patient: true },
    });
    if (!appt) throw new NotFoundException(`Appointment ${id} not found`);
    return appt;
  }

  async create(dto: CreateAppointmentDto) {
    await this.patients.findOne(dto.patientId);
    return this.repo.save(
      this.repo.create({ ...dto, scheduledAt: new Date(dto.scheduledAt) }),
    );
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    const { scheduledAt, ...rest } = dto;
    await this.repo.update(id, {
      ...rest,
      ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.repo.remove(await this.findOne(id));
  }
}
