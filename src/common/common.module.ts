import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ValidationService } from './validation/validation.service';
import { SupabaseService } from './supabase/supabase.service';
import { WebsocketGateway } from 'src/shared/config/websocket.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    SupabaseService,
    WebsocketGateway,
  ],
  exports: [
    PrismaService,
    ValidationService,
    SupabaseService,
    WebsocketGateway,
  ],
})
export class CommonModule {}
