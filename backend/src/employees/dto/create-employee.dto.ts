import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty()
  login: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  position: string;

  @ApiProperty({ required: false })
  department?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  currentLocation?: string;

  @ApiProperty({ required: false })
  workStatus?: string;

  @ApiProperty({ required: false })
  lastCheckIn?: string;

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  penalties?: number;

  @ApiProperty({ required: false })
  shiftStart?: string;

  @ApiProperty({ required: false })
  shiftEnd?: string;

  @ApiProperty({ required: false })
  lunchStart?: string;

  @ApiProperty({ required: false })
  lunchEnd?: string;
}