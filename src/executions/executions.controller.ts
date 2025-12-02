import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() body: { workflowId: number; inputData: any; name?: string }) {
    return this.executionsService.createExecution(req.user.id, body.workflowId, body.inputData, body.name);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.executionsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.executionsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Request() req, @Param('id') id: string) {
    return this.executionsService.remove(+id, req.user.id);
  }

  // Public webhook endpoint for N8N
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    const executionId = body.executionId;
    if (!executionId) {
        // Fallback for legacy or unknown events?
        // Maybe broadcast to global if needed, but we want to be specific
        return { error: 'Missing executionId' };
    }
    return this.executionsService.handleWebhook(executionId, body);
  }
}
