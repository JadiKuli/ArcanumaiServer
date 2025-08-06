import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IAuthSchema } from './types/schemas/auth.schema';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() data: IAuthSchema) {
    return this._authService.registerUser(data);
  }

  @Post('login')
  async loginUser(@Body() data: IAuthSchema) {
    return this._authService.loginUser(data);
  }
}
