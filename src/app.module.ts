import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './iherb/iherb.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from './configs/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
// import { TelegramModule } from './telegram/telegram.module';
// import { getTelegramConfig } from './configs/telegram.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    ProductModule,
    AuthModule,
    OrderModule,
    // TelegramModule.forRootAsync({
    //   imports: [ConfigModule, ProductModule],
    //   inject: [ConfigService],
    //   useFactory: getTelegramConfig,
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
