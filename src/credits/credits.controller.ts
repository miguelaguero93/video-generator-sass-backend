import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCredits(@Request() req) {
    return this.creditsService.getUserCredits(req.user.id);
  }

  @Post('deduct')
  @UseGuards(AuthGuard('jwt'))
  async deductCredits(@Request() req, @Body() body: { amount: number }) {
    return this.creditsService.deductCredits(req.user.id, body.amount);
  }

  @Post('add')
  @UseGuards(AuthGuard('jwt'))
  async addCredits(@Request() req, @Body() body: { amount: number }) {
    return this.creditsService.addCredits(req.user.id, body.amount);
  }

  // Stripe webhook endpoint (public)
  @Post('webhook/stripe')
  async handleStripeWebhook(@Body() body: any) {
    // TODO: Implement Stripe webhook handling
    // Verify signature, process payment, add credits
    console.log('Stripe webhook received:', body);
    return { received: true };
  }
}
