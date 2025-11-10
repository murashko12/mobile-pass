import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop({ default: 'IT' })
  department: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 'Не в офисе' })
  currentLocation: string;

  @Prop({ default: 'offline' })
  workStatus: string;

  @Prop({ default: () => new Date().toISOString() })
  lastCheckIn: string;

  @Prop({ default: 100 })
  rating: number;

  @Prop({ default: 0 })
  penalties: number;

  @Prop({ default: '09:00' })
  shiftStart: string;

  @Prop({ default: '18:00' })
  shiftEnd: string;

  @Prop({ default: '13:00' })
  lunchStart: string;

  @Prop({ default: '14:00' })
  lunchEnd: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);