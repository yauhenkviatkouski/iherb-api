import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class OrderItem {
  @Prop()
  product: string;

  @Prop()
  qty: number;
}

export interface OrderModel extends Document {}

@Schema({ collection: 'Orders' })
export class OrderModel {
  @Prop({ type: () => [OrderItem], _id: false })
  items: OrderItem[];

  @Prop()
  customer: string;

  @Prop()
  comment: string;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
