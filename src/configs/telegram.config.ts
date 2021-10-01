import { ConfigService } from '@nestjs/config';
import { ItelegramOptions } from 'src/telegram/telegram.interface';

export const getTelegramConfig = (configService: ConfigService): ItelegramOptions => {
  const token = configService.get('TELEGRAM_TOKEN');
  return {
    // TODO: delete chatId
    chatId: '',
    token,
  };
};
