import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { Scan } from './schemas/scan.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('scans')
@Controller('scans')
@UsePipes(new ValidationPipe({ transform: true }))
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новое сканирование' })
  @ApiResponse({ status: 201, description: 'Сканирование успешно создано' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async create(@Body() createScanDto: CreateScanDto): Promise<Scan> {
    return this.scansService.create(createScanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все сканирования' })
  async findAll(): Promise<Scan[]> {
    return this.scansService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Получить сканирования сотрудника' })
  async findByEmployee(@Param('employeeId') employeeId: string): Promise<Scan[]> {
    return this.scansService.findByEmployee(employeeId);
  }

  @Get('employee/:employeeId/today')
  @ApiOperation({ summary: 'Получить сегодняшние сканирования сотрудника' })
  async findTodayScans(@Param('employeeId') employeeId: string): Promise<Scan[]> {
    return this.scansService.findTodayScans(employeeId);
  }

  @Post('test-checkin')
  @ApiOperation({ summary: 'Тестовое сканирование входа' })
  async testCheckin(): Promise<Scan> {
    return this.scansService.create({
      qrCode: 'mobile-pass://checkin-out',
      qrType: 'checkin-out',
      location: 'Тестовый офис'
    });
  }

  @Post('test-lunch')
  @ApiOperation({ summary: 'Тестовое сканирование обеда' })
  async testLunch(): Promise<Scan> {
    return this.scansService.create({
      qrCode: 'mobile-pass://lunch-break',
      qrType: 'lunch-break',
      location: 'Тестовый офис'
    });
  }
}