import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { UserModel, UserSchema } from './user.model';

@Module({
  controllers: [AuthController],
  imports: [MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])],
})
export class AuthModule {}
