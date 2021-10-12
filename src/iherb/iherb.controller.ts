import { Controller, Get, Param, Post } from '@nestjs/common';
import { IherbService } from './iherb.service';

@Controller('iherb')
export class IherbController {
  constructor(private readonly iherbService: IherbService) {}

  @Get('/:uri')
  async get(@Param('uri') uri: string) {
    return this.iherbService.parseUri(uri);
  }

  // @Post('parse-uri')
  // async parse(@Body() body: any) {
  //   return body;
  // }
}
