import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a Review
  async createReview(dto: CreateReviewDto) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Try to determine if they purchased this product to set "isVerified"
    let isVerified = false;
    const confirmedOrders = await this.prisma.order.findFirst({
      where: {
        status: 'DELIVERED',
        user: { name: dto.author }, // Simpler correlation by name for demo/verified checks
        items: {
          some: {
            productId: dto.productId,
          },
        },
      },
    });
    if (confirmedOrders) {
      isVerified = true;
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
        author: dto.author,
        isVerified,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  // 2. Get Approved Reviews for a Product
  async getReviewsForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 3. Admin: Get All Reviews
  async getAdminReviews() {
    return this.prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  // 4. Admin: Moderate/Update Review Status
  async updateReviewStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        status: dto.status,
        isFeatured: dto.isFeatured !== undefined ? dto.isFeatured : review.isFeatured,
      },
    });
  }

  // 5. Admin: Delete Review
  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({
      where: { id },
    });
    return { success: true, message: 'Review deleted successfully' };
  }
}
