import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { AuthDto } from './dto/auth-employee.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    try {
      const { employeeId, name } = await this.employeesService.validateEmployee(
        authDto.login,
        authDto.password,
      );

      return {
        success: true,
        message: 'Авторизация успешна',
        data:{
          employeeId,
          name,
        },
      };
    } catch (error) {
      // Ловим NotFoundException и UnauthorizedException
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        return {
          success: false,
          message: error.message,
        };
      }
      // Для неожиданных ошибок — логируем и возвращаем общую фразу
      console.error('Ошибка авторизации:', error);
      return {
        success: false,
        message: 'Внутренняя ошибка сервера',
      };
    }
  }
}