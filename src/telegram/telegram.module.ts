import { DynamicModule, Global, Module, Options, Provider } from '@nestjs/common';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ITelegramModuleOptions } from './telegram.interface';
import { TelegramService } from './telegram.service';

@Global()
@Module({})
export class TelegramModule {
  static forRootAsync(options: ITelegramModuleOptions): DynamicModule {
    const asyncOptions = this.createAsyncOptionsProvider(options);
    return {
      module: TelegramModule,
      imports: options.imports,
      exports: [TelegramService],
      providers: [TelegramService, asyncOptions],
    };
  }

  static createAsyncOptionsProvider(options: ITelegramModuleOptions): Provider {
    return {
      provide: TELEGRAM_MODULE_OPTIONS,
      inject: options.inject || [],
      useFactory: async (...args: any[]) => {
        const config = await await options.useFactory(args);
        return config;
      },
    };
  }
}
