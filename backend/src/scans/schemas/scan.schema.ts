import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScanDocument = Scan & Document;

@Schema({ timestamps: true })
export class Scan {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ required: true, enum: ['checkin-out', 'lunch-break', 'unknown'] })
  qrType: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: 'Офис Company N' })
  location: string;

  @Prop({ default: 'pending', enum: ['pending', 'processed', 'error'] })
  status: string;

  @Prop()
  result?: string;
}

export const ScanSchema = SchemaFactory.createForClass(Scan);