import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Execution } from './entities/execution.entity';
import { Gateway } from '../gateway/gateway.gateway';
import { WorkflowsService } from '../workflows/workflows.service';
import { UsersService } from '../users/users.service';
import { CreditsService } from '../credits/credits.service';
import axios from 'axios';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(Execution)
    private executionsRepository: Repository<Execution>,
    private gateway: Gateway,
    private workflowsService: WorkflowsService,
    private usersService: UsersService,
    private creditsService: CreditsService,
  ) {}

  async createExecution(userId: number, workflowId: number, inputData: any, name?: string) {
    const user = await this.usersService.findOne(userId);
    const workflow = await this.workflowsService.findOne(workflowId);

    if (!user || !workflow) {
      throw new Error('User or Workflow not found');
    }

    // Deduct credits using CreditsService
    // This will throw BadRequestException if insufficient credits
    await this.creditsService.deductCredits(userId, workflow.cost);

    // Create execution record
    const execution = this.executionsRepository.create({
      userId,
      workflowId,
      status: 'running',
      data: inputData,
      name: name || workflow.name, // Default to workflow name if not provided
      events: [],
    });
    await this.executionsRepository.save(execution);

    // Trigger N8N
    try {
      // We pass executionId to N8N so it can report back
      const payload = {
        ...inputData,
        executionId: execution.id,
        workflowId: workflow.id, // Legacy support
      };
      
      // TODO: Get API Key from config or user settings? For now assume public or env
      // const apiKey = process.env.N8N_API_KEY;
      
      await axios.post(workflow.webhookUrl, payload);
    } catch (error) {
      console.error('Failed to trigger N8N:', error.message);
      // Refund credits? Maybe not if it's just a network error but we want to be safe
      // For now, just mark as error
      await this.executionsRepository.update(execution.id, { status: 'error' });
      throw error;
    }

    return execution;
  }

  async handleWebhook(executionId: number, event: any) {
    const execution = await this.executionsRepository.findOneBy({ id: executionId });
    if (!execution) {
      console.warn(`Execution ${executionId} not found for webhook event`);
      return;
    }

    // Append event
    const events = execution.events || [];
    events.push(event);
    
    let status = execution.status;
    if (event.type === 'final_result') {
        status = 'completed';
    } else if (event.type === 'error') {
        status = 'error';
    }

    await this.executionsRepository.update(executionId, { 
        events: events,
        status: status
    });

    // Emit socket event
    this.gateway.emitEvent(executionId, event);
  }

  async findAll(userId: number) {
    return this.executionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['workflow'],
    });
  }

  async findOne(id: number) {
    return this.executionsRepository.findOne({
        where: { id },
        relations: ['workflow', 'user']
    });
  }
  async remove(id: number, userId: number) {
    const execution = await this.executionsRepository.findOne({ where: { id, userId } });
    if (!execution) {
        throw new Error('Execution not found or access denied');
    }
    return this.executionsRepository.remove(execution);
  }
}
