import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('product')
export class ProductController {
  @Get(':uri')
  async get(@Param('uri') uri: string) {}
}
