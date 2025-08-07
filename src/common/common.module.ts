import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ValidationService } from './validation/validation.service';
import { SupabaseService } from './supabase/supabase.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService, ValidationService, SupabaseService],
  exports: [PrismaService, ValidationService, SupabaseService],
})
export class CommonModule {}
