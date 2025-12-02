import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ExecutionsModule } from './executions/executions.module';
import { GatewayModule } from './gateway/gateway.module';
import { MediaModule } from './media/media.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Workflow } from './workflows/entities/workflow.entity';
import { Execution } from './executions/entities/execution.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Workflow, Execution],
      synchronize: true, // Set to false in production
    }),
    ServeStaticModule.forRoot({
      rootPath: 'I:/Videos youtube/trol/',
      serveRoot: '/media',
    }),
    AuthModule,
    UsersModule,
    WorkflowsModule,
    ExecutionsModule,
    GatewayModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
