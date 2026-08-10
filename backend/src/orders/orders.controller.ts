import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { AddToCartDto, CheckoutDto, UpdateOrderStatusDto } from './orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('cart')
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: any) {
    return this.ordersService.getCart(user.id);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.ordersService.addToCart(user.id, dto);
  }

  @Delete('cart/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeFromCart(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.ordersService.removeFromCart(user.id, itemId);
  }

  // Limit checkout to 10 per minute (prevents spam orders)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrders(@CurrentUser() user: any) {
    return this.ordersService.getOrders(user.id);
  }

  @Get('tracking/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.trackOrder(orderNumber);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.view')
  async getAdminOrders() {
    return this.ordersService.getAdminOrders();
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.update')
  async updateOrderStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status, user.id);
  }

  // Limit webhook to 20 per minute (Razorpay bursts are possible)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post('payment-webhook')
  async processPaymentWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() dto: any,
  ) {
    return this.ordersService.processPaymentWebhook(dto, signature);
  }

  @Post('coupon/validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(@Body('code') code: string) {
    return this.ordersService.validateCoupon(code);
  }
}

