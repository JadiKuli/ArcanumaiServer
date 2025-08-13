/* eslint-disable */
import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { PostModule } from './module/post/post.module';
import { UserModule } from './module/user/user.module';
import { MusicService } from './module/music/music.service';
import { MusicController } from './module/music/music.controller';
import { MusicModule } from './module/music/music.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    PostModule,
    UserModule,
    MusicModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage/assets'),
      serveRoot: '/assets',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader(
            'Access-Control-Expose-Headers',
            'Content-Length, Content-Range',
          );
        },
      },
    }),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class AppModule {}
