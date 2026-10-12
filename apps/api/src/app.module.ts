import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.get('DB_PORT', 1433)),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [join(__dirname, 'migrations', '*.js')],
        migrationsRun: config.get('DB_MIGRATIONS_RUN') === 'true',
        connectionTimeout: 6000,
        retryAttempts: 10,
        retryDelay: 5000,
        options: {
          encrypt: config.get('DB_ENCRYPT') === 'true',
          trustServerCertificate: config.get('DB_TRUST_CERT') === 'true',
        },
      }),
    }),
    UsersModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
