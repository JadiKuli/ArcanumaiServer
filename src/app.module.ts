import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { PostModule } from './module/post/post.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [CommonModule, AuthModule, PostModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
