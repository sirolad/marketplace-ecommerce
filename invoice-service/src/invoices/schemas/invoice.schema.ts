import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true })
  orderId: string = '';

  @Prop({ required: true })
  filePath: string = '';

  @Prop()
  sentAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);