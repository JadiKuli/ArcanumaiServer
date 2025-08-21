import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { IAuthenticationRequest } from 'src/shared/types/request-user';
import { JwtGuard } from '../auth/jwt/guards/jwt.guard';
import { UserService } from './user.service';
import { IUserUpdatePayload } from './types/user';

@Controller('api/user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get()
  @UseGuards(JwtGuard)
  getUser(@Request() req: IAuthenticationRequest) {
    return this._userService.getUser(req.user.sub);
  }

  @Put()
  @UseGuards(JwtGuard)
  updateUser(
    @Request() req: IAuthenticationRequest,
    @Body() body: IUserUpdatePayload,
  ) {
    return this._userService.updateUser(body, req.user.sub);
  }

  @Get('/liked')
  @UseGuards(JwtGuard)
  userLikedContent(@Request() req: IAuthenticationRequest) {
    return this._userService.userLikedContent(req.user.sub);
  }
}
