import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IAuthSchema } from './types/schemas/auth.schema';
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() data: IAuthSchema) {
    return this._authService.registerUser(data);
  }

  @Post('login')
  async loginUser(
    @Body() data: IAuthSchema,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this._authService.loginUser(data);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: '.localdev.com',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'User successfully logged in, cookie created',
      data: user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: '.localdev.com',
    });
    return { message: 'Logged out' };
  }
}
