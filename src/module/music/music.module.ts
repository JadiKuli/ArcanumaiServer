import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { CommonModule } from 'src/common/common.module';
import { MusicWorker } from './worker/music.worker';

@Module({
  imports: [CommonModule],
  providers: [MusicService, MusicWorker],
  controllers: [MusicController],
})
export class MusicModule {}
