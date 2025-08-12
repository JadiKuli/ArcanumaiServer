import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { IAuthenticationRequest } from 'src/shared/types/request-user';
import { JwtGuard } from '../auth/jwt/guards/jwt.guard';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get()
  @UseGuards(JwtGuard)
  getUser(@Request() req: IAuthenticationRequest) {
    return this._userService.getUser(req.user.sub);
  }
}
