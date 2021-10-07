import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class OrderItem {
  @Prop()
  productName: string;

  @Prop()
  qty: number;

  @Prop()
  price: number;
}

export interface OrderModel extends Document {}

@Schema({ collection: 'Orders' })
export class OrderModel {
  @Prop({ type: () => [OrderItem], _id: false })
  items: OrderItem[];

  @Prop()
  customer: Types.ObjectId;

  @Prop()
  shipment: string;

  @Prop()
  comment: string;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
