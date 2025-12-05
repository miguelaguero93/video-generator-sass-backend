import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
// In a real app, we would have an AdminGuard here

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // Packages
  @Get('packages')
  getPackages() {
    return this.adminService.getPackages();
  }

  @Post('packages')
  createPackage(@Body() body: any) {
    return this.adminService.createPackage(body);
  }

  @Put('packages/:id')
  updatePackage(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePackage(+id, body);
  }

  @Delete('packages/:id')
  deletePackage(@Param('id') id: string) {
    return this.adminService.deletePackage(+id);
  }

  // Settings
  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings/:key')
  updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateSetting(key, value);
  }

  @Post('settings/seed')
  seedDefaultSettings() {
    return this.adminService.seedDefaultSettings();
  }

  // User Management
  @Get('users')
  getUsers(@Query('search') search?: string, @Query('page') page?: string) {
    return this.adminService.getUsers(search, page ? parseInt(page) : 1);
  }

  @Get('users/:id/stats')
  getUserStats(@Param('id') id: string) {
    return this.adminService.getUserStats(+id);
  }

  @Post('users/:id/credits')
  adjustUserCredits(@Param('id') id: string, @Body('amount') amount: number) {
    return this.adminService.adjustUserCredits(+id, amount);
  }

  @Post('users/:id/toggle-admin')
  toggleUserAdmin(@Param('id') id: string) {
    return this.adminService.toggleUserAdmin(+id);
  }
}
