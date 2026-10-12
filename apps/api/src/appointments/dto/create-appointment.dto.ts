import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt() patientId!: number;
  @IsString() @MaxLength(100) providerName!: string;
  @IsDateString() scheduledAt!: string; // ISO, e.g. "2026-10-20T14:30:00Z"
  @IsOptional() @IsInt() @Min(5) @Max(240) durationMinutes?: number;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
  @IsOptional() @IsIn(['scheduled', 'completed', 'cancelled']) status?:
    'scheduled' | 'completed' | 'cancelled';
}
