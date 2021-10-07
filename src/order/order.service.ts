import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderModel } from './order.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(OrderModel.name) private readonly orderModel: Model<OrderModel>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Document<OrderModel>> {
    return this.orderModel.create(dto);
  }

  async delete(id: string): Promise<Document<OrderModel | null>> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }

  async findById(id: string): Promise<Document<OrderModel | null>> {
    return this.orderModel.findById(id).exec();
  }

  async findByCustomer(customer: string): Promise<Document<OrderModel | null>[]> {
    return this.orderModel.find({ customer }).exec();
  }
}
