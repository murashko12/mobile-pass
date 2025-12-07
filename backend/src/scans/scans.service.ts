import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Scan, ScanDocument } from './schemas/scan.schema';
import { CreateScanDto } from './dto/create-scan.dto';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';

@Injectable()
export class ScansService {
  constructor(
    @InjectModel(Scan.name) private scanModel: Model<ScanDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  private formatMinutesToTime(totalMinutes: number): string {
    // Нормализуем отрицательное время (например, 12:50 → 770, но 12:50 - 10 мин = 760 → OK)
    // Если вышли за 00:00, корректируем (не обязательно, если tolerance мал)
    const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  async create(createScanDto: CreateScanDto): Promise<Scan> {
    // Если employeeId не предоставлен, ищем по логину или используем тестового пользователя
    let employeeId = createScanDto.employeeId;

    /*if (!employeeId) {
      // В реальном приложении здесь была бы аутентификация
      const testEmployee = await this.employeeModel.findOne({ login: 'test1' });
      employeeId = testEmployee?._id?.toString(); // Добавляем опциональную цепочку
    }*/

    console.log('Scann recieved!');

    if (!employeeId) {
      throw new BadRequestException('Employee not found');
    }

    const scanData = {
      ...createScanDto,
      employeeId: new Types.ObjectId(employeeId),
      timestamp: new Date(),
      status: 'pending',
    };

    const scan = new this.scanModel(scanData);
    const savedScan = await scan.save();

    // Обрабатываем сканирование
    await this.processScan(savedScan);

    return savedScan;
  }

  private async processScan(scan: ScanDocument): Promise<void> {
    try {
      const employee = await this.employeeModel.findById(scan.employeeId);
      const debug = false;
      
      if (!employee) {
        scan.status = 'error';
        scan.result = 'Employee not found';
        await scan.save();
        return;
      }

      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const [startLunchHour, startLunchMin] = employee.lunchStart.split(':').map(Number);
      const [endLunchHour, endLunchMin] = employee.lunchEnd.split(':').map(Number);
      const expectedLunchStartMinutes = startLunchHour * 60 + startLunchMin;
      const expectedLunchEndMinutes = endLunchHour * 60 + endLunchMin;
      const [checkInHour, checkInMin] = employee.lunchStart.split(':').map(Number);
      const [checkOutHour, checkOutMin] = employee.lunchEnd.split(':').map(Number);
      const expectedCheckInMinutes = checkInHour * 60 + checkInMin;
      const expectedCheckOutMinutes = checkOutHour * 60 + checkOutMin;
      const currentTotalMinutes = currentHour * 60 + currentMinutes;
      const TOLERANCE = 10;

      let resultMessage = '';

      switch (scan.qrType) {
        case 'checkin-out':
          if (employee.workStatus === 'offline') {
            if (
                (currentTotalMinutes <= expectedCheckInMinutes + TOLERANCE) || debug
              ){
                // Приход на работу
                employee.workStatus = 'online';
                employee.currentLocation = 'В офисе';
                employee.lastCheckIn = currentTime.toISOString();
                resultMessage = `Приход на работу в ${currentTimeString}`;
              } else {
                const minTime = this.formatMinutesToTime(expectedCheckInMinutes - TOLERANCE);
                const maxTime = this.formatMinutesToTime(expectedCheckInMinutes + TOLERANCE);
                resultMessage = `Начало смены разрешено только с ${minTime} до ${maxTime}. Сейчас: ${currentTimeString}.`;
                scan.status = 'error';
                scan.result = resultMessage;
                await scan.save();
                return;
              }
          } else if (employee.workStatus === 'online') {
            // Уход с работы
            if (
                (currentTotalMinutes >= expectedCheckOutMinutes - TOLERANCE) || debug
              ){
                employee.workStatus = 'offline';
                employee.currentLocation = 'Не в офисе';
                resultMessage = `Уход с работы в ${currentTimeString}`;
              } else {
                const minTime = this.formatMinutesToTime(expectedCheckOutMinutes - TOLERANCE);
                const maxTime = this.formatMinutesToTime(expectedCheckOutMinutes + TOLERANCE);
                resultMessage = `Завершение работы разрешено только с ${minTime} до ${maxTime}. Сейчас: ${currentTimeString}.`;
                scan.status = 'error';
                scan.result = resultMessage;
                await scan.save();
                return;
              } 
            } else{
              resultMessage = `Некорректный статус для входа/выхода: ${employee.workStatus}`;
            }
        break;

        case 'lunch-break':
          if (employee.currentLocation === 'В офисе') {
            if (
                (currentTotalMinutes >= expectedLunchStartMinutes - TOLERANCE &&
                currentTotalMinutes <= expectedLunchStartMinutes + TOLERANCE) || debug
              ){
                employee.currentLocation = 'На обеде';
                resultMessage = `Начало обеда в ${currentTimeString}`;
              } else {
                const minTime = this.formatMinutesToTime(expectedLunchStartMinutes - TOLERANCE);
                const maxTime = this.formatMinutesToTime(expectedLunchStartMinutes + TOLERANCE);
                resultMessage = `Начало обеда разрешено только с ${minTime} до ${maxTime}. Сейчас: ${currentTimeString}.`;
                scan.status = 'error';
                scan.result = resultMessage;
                await scan.save();
                return;
              }
          } else if (employee.currentLocation === 'На обеде') {
            if (
              (currentTotalMinutes >= expectedLunchEndMinutes - TOLERANCE &&
              currentTotalMinutes <= expectedLunchEndMinutes + TOLERANCE) || debug
            ) {
              employee.currentLocation = 'В офисе';
              resultMessage = `Конец обеда в ${currentTimeString}`;
            } else {
              const minTime = this.formatMinutesToTime(expectedLunchEndMinutes - TOLERANCE);
              const maxTime = this.formatMinutesToTime(expectedLunchEndMinutes + TOLERANCE);
              resultMessage = `Окончание обеда разрешено только с ${minTime} до ${maxTime}. Сейчас: ${currentTimeString}.`;
              scan.status = 'error';
              scan.result = resultMessage;
              await scan.save();
              return;
            }
          } else {
            resultMessage = `Некорректный статус для обеда: ${employee.currentLocation}`;
          }
          break;

        default:
          resultMessage = `Неизвестный тип QR-кода: ${scan.qrCode}`;
      }

      // Обновляем статус сканирования
      scan.status = 'processed';
      scan.result = resultMessage;

      // Сохраняем изменения
      await employee.save();
      await scan.save();

      console.log(`Scan processed: ${resultMessage}`);

    } catch (error) {
      scan.status = 'error';
      scan.result = `Processing error: ${error.message}`;
      await scan.save();
      console.error('Error processing scan:', error);
    }
  }

  async findAll(): Promise<Scan[]> {
    return this.scanModel
      .find()
      .populate('employeeId', 'name position department')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEmployee(employeeId: string): Promise<Scan[]> {
    return this.scanModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('employeeId', 'name position department')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findTodayScans(employeeId: string): Promise<Scan[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.scanModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .populate('employeeId', 'name position department')
      .sort({ createdAt: -1 })
      .exec();
  }
}