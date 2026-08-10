import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HampersService } from './hampers.service';
import { CreateHamperBoxDto, CreateHamperComponentDto, BuildHamperDto } from './hampers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('hampers')
export class HampersController {
  constructor(private hampersService: HampersService) {}

  @Get('boxes')
  async getBoxes() {
    return this.hampersService.getBoxes();
  }

  @Post('boxes')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  async createBox(@Body() dto: CreateHamperBoxDto) {
    return this.hampersService.createBox(dto);
  }

  @Get('components')
  async getComponents() {
    return this.hampersService.getComponents();
  }

  @Post('components')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  async createComponent(@Body() dto: CreateHamperComponentDto) {
    return this.hampersService.createComponent(dto);
  }

  @Post('build')
  async buildHamper(@Body() dto: BuildHamperDto) {
    return this.hampersService.buildHamper(dto);
  }

  @Get(':id')
  async getHamperDetails(@Param('id') id: string) {
    return this.hampersService.getHamperDetails(id);
  }
}
