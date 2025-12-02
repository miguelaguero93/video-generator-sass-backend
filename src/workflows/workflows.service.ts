import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
  ) {}

  create(createWorkflowDto: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflowsRepository.create(createWorkflowDto);
    return this.workflowsRepository.save(workflow);
  }

  findAll(): Promise<Workflow[]> {
    return this.workflowsRepository.find();
  }

  findOne(id: number): Promise<Workflow | null> {
    return this.workflowsRepository.findOneBy({ id });
  }

  async update(id: number, updateWorkflowDto: Partial<Workflow>): Promise<Workflow> {
    await this.workflowsRepository.update(id, updateWorkflowDto);
    const workflow = await this.findOne(id);
    if (!workflow) {
        throw new Error('Workflow not found');
    }
    return workflow;
  }

  async remove(id: number): Promise<void> {
    await this.workflowsRepository.delete(id);
  }
}
