import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateScanDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @IsString()
  qrCode: string;

  @IsEnum(['checkin-out', 'lunch-break', 'unknown'])
  qrType: string;

  @IsString()
  @IsOptional()
  location?: string;
}