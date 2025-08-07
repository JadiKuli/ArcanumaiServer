import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ValidationService } from 'src/common/validation/validation.service';
import { AuthSchema, IAuthSchema } from './types/schemas/auth.schema';
import * as bcrypt from 'bcrypt';
import { IPayload } from './types/payload/auth.payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _validationService: ValidationService,
    private readonly _jwtService: JwtService,
  ) {}

  // Register User
  async createUser(data: IAuthSchema) {
    const validationUser = this._validationService.validate(AuthSchema, data);
    const findUser = await this._prismaService.user.findFirst({
      where: {
        username: validationUser.username,
      },
    });

    if (findUser) {
      throw new ConflictException('User already exists');
    }

    const createUser = await this._prismaService.user.create({
      data: {
        username: validationUser.username,
        password: await bcrypt.hash(validationUser.password, 10),
      },
      include: {
        UserWallet: true,
      },
    });

    return createUser;
  }

  async registerUser(data: IAuthSchema) {
    const createUser = await this.createUser(data);

    return {
      message: 'User successfully created',
      data: {
        id: createUser.id,
        username: createUser.username,
      },
    };
  }

  // Login User
  async findUser(username: string) {
    return await this._prismaService.user.findFirst({
      where: {
        username,
      },
    });
  }

  async loginUser(data: IAuthSchema) {
    const validationUser = this._validationService.validate(AuthSchema, data);
    const findUser = await this.findUser(validationUser.username);

    if (!findUser) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      validationUser.password,
      findUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload: IPayload = {
      sub: findUser.id,
      username: findUser.username,
    };
    const token = await this._jwtService.signAsync(payload);

    return {
      message: 'User successfully logged in',
      data: {
        access_token: token,
        user: {
          id: findUser.id,
          username: findUser.username,
        },
      },
    };
  }
}
