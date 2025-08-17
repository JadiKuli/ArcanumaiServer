import { Controller, Param, Post } from '@nestjs/common';
import { TestingWorker } from './worker/testing.worker';

@Controller('api/testing')
export class TestingController {
  constructor(private readonly _worker: TestingWorker) {}

  @Post(':id/start')
  startTask(@Param('id') taskId: string) {
    this._worker.boot(taskId);
    return { taskId: taskId };
  }
}
