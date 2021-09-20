import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderModel, OrderSchema } from './order.model';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  imports: [
    MongooseModule.forFeature([
      {
        name: OrderModel.name,
        schema: OrderSchema,
      },
    ]),
  ],
  providers: [OrderService],
})
export class OrderModule {}
