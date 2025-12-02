import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { Workflow } from './entities/workflow.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createWorkflowDto: Partial<Workflow>) {
    return this.workflowsService.create(createWorkflowDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateWorkflowDto: Partial<Workflow>) {
    return this.workflowsService.update(+id, updateWorkflowDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(+id);
  }
}
