import { Inject, Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ItelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
  bot: Telegraf;
  options: ItelegramOptions;

  constructor(@Inject(TELEGRAM_MODULE_OPTIONS) options: ItelegramOptions) {
    this.bot = new Telegraf(options.token);
    this.options = options;
  }

  async sendMessage(chatId, message) {
    this.bot.telegram.sendMessage(chatId, message);
  }
}
