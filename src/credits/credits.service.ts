import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Gateway } from '../gateway/gateway.gateway';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private gateway: Gateway,
  ) {}

  async getUserCredits(userId: number): Promise<{ credits: number; totalSpent: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      credits: user.credits,
      totalSpent: user.totalCreditsSpent,
    };
  }

  async deductCredits(userId: number, amount: number): Promise<{ credits: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.credits < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    user.credits -= amount;
    user.totalCreditsSpent += amount;
    await this.usersRepository.save(user);

    this.gateway.emitCreditUpdate(userId, user.credits, user.totalCreditsSpent);

    return { credits: user.credits };
  }

  async addCredits(userId: number, amount: number): Promise<{ credits: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.credits += amount;
    await this.usersRepository.save(user);

    this.gateway.emitCreditUpdate(userId, user.credits, user.totalCreditsSpent);

    return { credits: user.credits };
  }

  async checkSufficientCredits(userId: number, required: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return !!(user && user.credits >= required);
  }
}
