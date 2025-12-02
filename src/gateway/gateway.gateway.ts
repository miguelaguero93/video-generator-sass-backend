import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (token) {
        const payload = this.jwtService.verify(token, { secret: 'your-secret-key-change-this-in-production' });
        const userId = payload.sub;
        client.join(`user_${userId}`);
        console.log(`Client ${client.id} joined user_${userId}`);
      }
    } catch (e) {
      console.log('Client connection auth failed:', e.message);
    }
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

  emitCreditUpdate(userId: number, credits: number, totalSpent: number) {
    this.server.to(`user_${userId}`).emit('credits_updated', { credits, totalSpent });
  }
}
