import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: email.toLocaleLowerCase() } });
  }

  async create(email: string, password: string, fullName: string) {
    if (await this.findByEmail(email))
      throw new ConflictException('Email already registered');
    const passwordHash = await hash(password, 12);
    return this.repo.save(
      this.repo.create({
        email: email.toLocaleLowerCase(),
        passwordHash,
        fullName,
      }),
    );
  }
}
