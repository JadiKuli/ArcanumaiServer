import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { CommonModule } from 'src/common/common.module';
import { TestingWorker } from './worker/testing.worker';

@Module({
  imports: [CommonModule],
  providers: [TestingService, TestingWorker],
  controllers: [TestingController],
})
export class TestingModule {}
