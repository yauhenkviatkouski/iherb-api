import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  @HttpCode(200)
  @Get(':id')
  async get(@Param('id') id: string) {

  }

  @HttpCode(201)
  @Post('create')
  async create(@Body() dto: CreateOrderDto) {

  }
}
