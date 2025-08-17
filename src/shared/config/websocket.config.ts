import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log('✅ Client connected:', client.id);

    client.on('subscribe', (taskId: string) => {
      this.clients.set(taskId, client);
      console.log(`📌 Client ${client.id} subscribe ke task ${taskId}`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Client disconnected:', client.id);
    [...this.clients.entries()].forEach(([taskId, sock]) => {
      if (sock.id === client.id) this.clients.delete(taskId);
    });
  }

  sendMessage(taskId: string, status: string, message: string) {
    const client = this.clients.get(taskId);
    if (client) {
      client.emit('task-update', {
        taskId,
        status,
        message,
        timestamp: new Date(),
      });
    }
  }
}
