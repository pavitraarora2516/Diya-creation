import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateBlogPostDto, UpdateSettingDto } from './cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller()
export class CmsController {
  constructor(private cmsService: CmsService) {}

  // Public: Get All Blog Posts
  @Get('blog')
  async getAllBlogPosts() {
    return this.cmsService.getAllBlogPosts();
  }

  // Public: Get Blog Post by Slug
  @Get('blog/:slug')
  async getBlogPostBySlug(@Param('slug') slug: string) {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  // Admin: Create Blog Post
  @Post('blog')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  async createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.cmsService.createBlogPost(dto);
  }

  // Admin: Delete Blog Post
  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.delete')
  async deleteBlogPost(@Param('id') id: string) {
    return this.cmsService.deleteBlogPost(id);
  }

  // Public: Get Platform Setting
  @Get('cms/settings/:key')
  async getSetting(@Param('key') key: string) {
    return this.cmsService.getSetting(key);
  }

  // Admin: Update Platform Setting
  @Put('cms/settings/:key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reports.view')
  async updateSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.cmsService.updateSetting(key, dto.value);
  }
}
