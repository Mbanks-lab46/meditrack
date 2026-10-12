import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private readonly repo: Repository<Patient>,
  ) {}

  findAll(search?: string) {
    const where = search ? [{ lastName: Like('%{search}%') }] : {};
    return this.repo.find({
      where,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: number) {
    const patient = await this.repo.findOne({
      where: { id },
      relations: { appointments: true },
      order: { appointments: { scheduledAt: 'DESC' } },
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient;
  }

  create(dto: CreatePatientDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdatePatientDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const patient = await this.findOne(id);
    await this.repo.remove(patient);
  }
}
