import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { ScansModule } from './scans/scans.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/mobile-pass'),
    EmployeesModule,
    ScansModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
export class AuthModule {}