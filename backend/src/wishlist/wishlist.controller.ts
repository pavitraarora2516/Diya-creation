import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  // 1. Get current user's wishlist
  @Get()
  async getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.id);
  }

  // 2. Add product to wishlist
  @Post(':productId')
  async addToWishlist(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(user.id, productId);
  }

  // 3. Remove product from wishlist
  @Delete(':productId')
  async removeFromWishlist(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(user.id, productId);
  }
}
