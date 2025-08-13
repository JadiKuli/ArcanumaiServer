import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [MusicService],
  controllers: [MusicController],
})
export class MusicModule {}
