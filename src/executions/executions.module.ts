import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { Execution } from './entities/execution.entity';
import { WorkflowsModule } from '../workflows/workflows.module';
import { UsersModule } from '../users/users.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Execution]),
    WorkflowsModule,
    UsersModule,
    GatewayModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
