import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { GenerateMusicPayload } from './types/music';
import { JwtGuard } from '../auth/jwt/guards/jwt.guard';
import { IAuthenticationRequest } from 'src/shared/types/request-user';

@Controller('api/music')
export class MusicController {
  constructor(private readonly _musicService: MusicService) {}

  // Create Music
  @Post()
  @UseGuards(JwtGuard)
  async createMusic(
    @Request() req: IAuthenticationRequest,
    @Body() payload: GenerateMusicPayload,
  ) {
    return await this._musicService.createMusic(req.user.sub, payload);
  }

  // Get Music User
  @Get('user/all')
  @UseGuards(JwtGuard)
  async getMusic(@Request() req: IAuthenticationRequest) {
    return await this._musicService.getMusic(req.user.sub);
  }

  // Get All Music
  @Get('all')
  async getAllMusic() {
    return await this._musicService.getAllMusic();
  }

  // Get Progress Music
  @Get(':id')
  @UseGuards(JwtGuard)
  async getProgressMusic(
    @Request() req: IAuthenticationRequest,
    @Param('id') id: string,
  ) {
    return await this._musicService.getProgressMusic(req.user.sub, id);
  }
}
