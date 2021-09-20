import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderModel } from './order.model';

@Injectable()
export class OrderService {
  constructor(@InjectModel(OrderModel.name) private readonly orderModel: OrderModel) {}
}
