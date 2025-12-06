import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { Employee } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех сотрудников' })
  @ApiResponse({ status: 200, description: 'Список сотрудников', type: [Employee] })
  async findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сотрудника по ID' })
  @ApiResponse({ status: 200, description: 'Данные сотрудника', type: Employee })
  @ApiResponse({ status: 404, description: 'Сотрудник не найден' })
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Get('by-login/:login')
  @ApiOperation({ summary: 'Получить сотрудника по Login' })
  @ApiResponse({ status: 200, description: 'Данные сотрудника', type: Employee })
  @ApiResponse({ status: 404, description: 'Сотрудник не найден' })
  async findOneByLogin(@Param('login') login: string): Promise<Employee> {
    return this.employeesService.findOneByLogin(login);
  }

  @Post()
  @ApiOperation({ summary: 'Создать нового сотрудника' })
  @ApiResponse({ status: 201, description: 'Сотрудник создан', type: Employee })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные сотрудника' })
  @ApiResponse({ status: 200, description: 'Данные обновлены', type: Employee })
  @ApiResponse({ status: 404, description: 'Сотрудник не найден' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить сотрудника' })
  @ApiResponse({ status: 200, description: 'Сотрудник удален' })
  @ApiResponse({ status: 404, description: 'Сотрудник не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}