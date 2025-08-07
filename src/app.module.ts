import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { PostModule } from './module/post/post.module';

@Module({
  imports: [CommonModule, AuthModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
