import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwtAuthGuard';
import { UserLogin } from './decorators/userLogin.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // getHello(@UserLogin() user: string): string {
  //   return this.appService.getHello(user);
  // }
}
