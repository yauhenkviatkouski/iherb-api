import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/createOrder.dto';

@Controller('order')
export class OrderController {
  @HttpCode(200)
  @Get(':id')
  async get(@Param('id') id: string) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(201)
  @Post('create')
  async create(@Body() dto: CreateOrderDto) {}
}
