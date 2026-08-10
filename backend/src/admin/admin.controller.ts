import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions('reports.view')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('customization-queue')
  @RequirePermissions('customizations.review')
  async getCustomizationQueue() {
    return this.adminService.getCustomizationQueue();
  }

  @Put('customization-queue/:itemId')
  @RequirePermissions('customizations.review')
  async updateCustomizationStatus(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateCustomizationStatus(itemId, status, user.id);
  }
}
