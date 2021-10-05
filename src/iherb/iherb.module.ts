import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IherbController } from './iherb.controller';
import { IherbService } from './iherb.service';

@Module({
  imports: [HttpModule],
  controllers: [IherbController],
  providers: [IherbService],
  exports: [IherbService],
})
export class ProductModule {}
