import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { HampersModule } from './hampers/hampers.module';
import { OrdersModule } from './orders/orders.module';
import { CorporateModule } from './corporate/corporate.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CmsModule } from './cms/cms.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Global rate limiting — limits configurable via environment variables
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: Number(process.env.THROTTLE_TTL_SECONDS || 60) * 1000, // ms
        limit: Number(process.env.THROTTLE_LIMIT || 100),
      },
    ]),
    PrismaModule,
    AuthModule,
    ProductsModule,
    HampersModule,
    OrdersModule,
    CorporateModule,
    AdminModule,
    ReviewsModule,
    WishlistModule,
    CmsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // Apply ThrottlerGuard globally to all routes
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

