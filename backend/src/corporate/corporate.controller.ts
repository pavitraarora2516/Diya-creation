import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CreateCorporateLeadDto, CreateQuotationDto } from './corporate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('corporate')
export class CorporateController {
  constructor(private corporateService: CorporateService) {}

  @Post('lead')
  async createLead(@Body() dto: CreateCorporateLeadDto) {
    return this.corporateService.createLead(dto);
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.view')
  async getLeads() {
    return this.corporateService.getLeads();
  }

  @Put('leads/:id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.update')
  async updateLeadStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.corporateService.updateLeadStatus(id, status);
  }

  @Post('quotation')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.update')
  async createQuotation(@CurrentUser() user: any, @Body() dto: CreateQuotationDto) {
    return this.corporateService.createQuotation(dto, user.id);
  }

  @Get('quotations/:leadId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.view')
  async getQuotationsByLead(@Param('leadId') leadId: string) {
    return this.corporateService.getQuotationsByLead(leadId);
  }
}
