import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join_execution')
  handleJoinExecution(@MessageBody() executionId: string, @ConnectedSocket() client: Socket) {
    client.join(`execution_${executionId}`);
    console.log(`Client ${client.id} joined execution_${executionId}`);
  }

  emitEvent(executionId: number, event: any) {
    this.server.to(`execution_${executionId}`).emit('workflow_event', event);
  }
}
