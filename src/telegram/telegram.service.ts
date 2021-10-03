import { Inject, Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { Telegraf } from 'telegraf';
import { MESSAGES, TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ItelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
  bot: Telegraf;
  options: ItelegramOptions;

  constructor(
    @Inject(TELEGRAM_MODULE_OPTIONS) options: ItelegramOptions,
    private readonly productService: ProductService,
  ) {
    this.bot = new Telegraf(options.token);
    this.options = options;

    this.bot.start((ctx) => {
      ctx.reply(MESSAGES.ON_START);
      ctx.reply(MESSAGES.ON_WAITING_ORDER);
    });

    this.bot.on('message', (ctx) => {
      console.log(JSON.stringify(ctx));
    });

    this.bot.launch();
  }

  async sendMessage(chatId, message) {
    this.bot.telegram.sendMessage(chatId, message);
  }
}
