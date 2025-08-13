import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { PostModule } from './module/post/post.module';
import { UserModule } from './module/user/user.module';
import { MusicService } from './module/music/music.service';
import { MusicController } from './module/music/music.controller';
import { MusicModule } from './module/music/music.module';

@Module({
  imports: [CommonModule, AuthModule, PostModule, UserModule, MusicModule],
  controllers: [MusicController],
  providers: [MusicService],
})
export class AppModule {}
