import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from 'src/shared/config/websocket.config';

@Injectable()
export class TestingWorker {
  private static point = 10;

  constructor(private readonly _ws: WebsocketGateway) {}

  public boot(taskId: string): void {
    console.log('Booting App...');

    const pollQueue = () => {
      console.log('👉 pollQueue jalan, point:', TestingWorker.point);

      if (TestingWorker.point !== 0) {
        TestingWorker.point -= 1;
        console.log('⏳ kirim WS processing...');
        this._ws.sendMessage(taskId, 'processing', 'On Going...');
        setTimeout(pollQueue, 4000);
      } else {
        TestingWorker.point = 5;
        console.log('✅ selesai, kirim WS success');
        this._ws.sendMessage(taskId, 'successed', 'Success');
      }
    };

    pollQueue();
  }
}
