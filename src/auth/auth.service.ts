import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { UserModel } from './user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  async createUSer(dto: AuthDto) {
    const salt = await genSalt(10);
    const newUser = await new this.userModel({
      login: dto.login,
      passwordHash: await hash(dto.password, salt),
    });

    return newUser.save();
  }

  async findUser(login: string) {
    return this.userModel.findOne({ login }).exec();
  }

  async validateUser(login: string, password: string): Promise<Pick<UserModel, 'login'>> {
    const user = await this.findUser(login);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isCorrectPassword = await compare(password, user.passwordHash);
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Wrong password');
    }
    return { login: user.login };
  }

  async login(login: string) {
    const payload = { login };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
