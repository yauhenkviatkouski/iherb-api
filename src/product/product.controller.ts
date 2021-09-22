import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get('iherb/:uri')
  async get(@Param('uri') uri: string) {
    return this.productService.getProductInfo(uri);
  }
}
