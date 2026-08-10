import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  // 1. Get User's Wishlist
  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
    });
  }

  // 2. Add Product to Wishlist
  async addToWishlist(userId: string, productId: string) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if already wishlisted
    const existing = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });
    if (existing) {
      return existing; // Return existing record if already wishlisted
    }

    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  // 3. Remove Product from Wishlist
  async removeFromWishlist(userId: string, productId: string) {
    const record = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (!record) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlist.delete({
      where: { id: record.id },
    });

    return { success: true, message: 'Item removed from wishlist' };
  }
}
