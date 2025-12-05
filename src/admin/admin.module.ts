import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { CreditPackage } from '../credits/entities/credit-package.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CreditPackage, SystemSetting]),
    CreditsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
