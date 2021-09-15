import { Controller, Get, Param } from '@nestjs/common';

@Controller('product')
export class ProductController {

  @Get(':uri')
  async get(@Param('uri') uri: string) {

  }
}
