import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './reviews.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Public: Submit Review
  @Post()
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  // Public: Get Approved Reviews for a Product
  @Get('product/:productId')
  async getReviewsForProduct(@Param('productId') productId: string) {
    return this.reviewsService.getReviewsForProduct(productId);
  }

  // Admin: Get All Reviews
  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.view')
  async getAdminReviews() {
    return this.reviewsService.getAdminReviews();
  }

  // Admin: Moderate Review Status
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.edit')
  async updateReviewStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviewsService.updateReviewStatus(id, dto);
  }

  // Admin: Delete Review
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.delete')
  async deleteReview(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
