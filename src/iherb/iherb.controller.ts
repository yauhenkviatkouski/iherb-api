import { Controller, Get, Param } from '@nestjs/common';
import { IherbService } from './iherb.service';

@Controller('iherb')
export class IherbController {
  constructor(private readonly iherbService: IherbService) {}
  @Get('/:uri')
  async get(@Param('uri') uri: string) {
    return this.iherbService.getProductsInfo(uri);
  }
}
