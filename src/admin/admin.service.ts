import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreditPackage } from '../credits/entities/credit-package.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CreditPackage)
    private packagesRepository: Repository<CreditPackage>,
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
    private creditsService: CreditsService,
  ) {}

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const totalCreditsActive = await this.usersRepository.sum('credits');
    const totalCreditsSpent = await this.usersRepository.sum('totalCreditsSpent');
    
    // Calculate revenue if we had payment records, for now mock it or use credits spent * avg price
    // This is a placeholder for actual revenue calculation
    const estimatedRevenue = (totalCreditsSpent || 0) * 0.5; // Assuming $0.5 per credit avg

    return {
      totalUsers,
      totalCreditsActive: totalCreditsActive || 0,
      totalCreditsSpent: totalCreditsSpent || 0,
      estimatedRevenue,
    };
  }

  // Packages
  async getPackages() {
    return this.packagesRepository.find({ order: { price: 'ASC' } });
  }

  async createPackage(data: Partial<CreditPackage>) {
    const pkg = this.packagesRepository.create(data);
    return this.packagesRepository.save(pkg);
  }

  async updatePackage(id: number, data: Partial<CreditPackage>) {
    await this.packagesRepository.update(id, data);
    return this.packagesRepository.findOne({ where: { id } });
  }

  async deletePackage(id: number) {
    return this.packagesRepository.delete(id);
  }

  // Settings
  async getSettings() {
    return this.settingsRepository.find();
  }

  async updateSetting(key: string, value: string) {
    let setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepository.create({ key, value });
    } else {
      setting.value = value;
    }
    return this.settingsRepository.save(setting);
  }

  async seedDefaultSettings() {
    const defaultSettings: Array<{key: string, value: string, description: string, type: 'string' | 'number' | 'boolean' | 'json'}> = [
      { key: 'N8N_API_URL', value: 'http://localhost:5678', description: 'N8N instance URL', type: 'string' },
      { key: 'N8N_API_KEY', value: '', description: 'API key for N8N authentication', type: 'string' },
      { key: 'DEFAULT_USER_CREDITS', value: '10', description: 'Credits given to new users', type: 'number' },
      { key: 'COST_PROMPT_RECREATE', value: '1', description: 'Default cost for recreating prompts', type: 'number' },
      { key: 'COST_SCENE_REPROCESS', value: '2', description: 'Default cost for reprocessing scenes', type: 'number' },
    ];

    for (const settingData of defaultSettings) {
      const existing = await this.settingsRepository.findOne({ where: { key: settingData.key } });
      if (!existing) {
        const setting = this.settingsRepository.create(settingData);
        await this.settingsRepository.save(setting);
      }
    }

    return { message: 'Default settings seeded successfully' };
  }

  // User Management
  async getUsers(search?: string, page: number = 1, limit: number = 20) {
    const query = this.usersRepository.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.credits', 'user.totalCreditsSpent', 'user.isAdmin', 'user.createdAt']);

    if (search) {
      query.where('user.email LIKE :search', { search: `%${search}%` });
    }

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserStats(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count user's executions (projects) - need to inject Execution repository
    // For now, return 0 as placeholder
    const projectCount = 0;

    return {
      id: user.id,
      email: user.email,
      credits: user.credits,
      totalCreditsSpent: user.totalCreditsSpent,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      projectCount
    };
  }

  async adjustUserCredits(userId: number, amount: number) {
    if (amount > 0) {
      return this.creditsService.addCredits(userId, amount);
    } else {
      return this.creditsService.deductCredits(userId, Math.abs(amount));
    }
  }

  async toggleUserAdmin(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isAdmin = !user.isAdmin;
    await this.usersRepository.save(user);
    return { isAdmin: user.isAdmin };
  }
}
