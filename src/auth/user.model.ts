import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface UserModel extends Document {}

@Schema({ collection: 'Users' })
export class UserModel {
  @Prop({ unique: true })
  login: string;

  @Prop()
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
