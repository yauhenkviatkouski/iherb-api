import { ModuleMetadata } from '@nestjs/common';

export interface ItelegramOptions {
  chatId: string;
  token: string;
}

export interface ITelegramModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<ItelegramOptions> | ItelegramOptions;
  inject?: any[];
}
