import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(user: string): string {
    return 'Hello World and ' + user;
  }
}
