import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

class OrderItem {
  @Prop()
  product: string;

  @Prop()
  qty: number;
}

export interface OrderModel {}

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
