import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, CheckoutDto } from './orders.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 1. Cart Management
  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            hamper: {
              include: {
                box: true,
                items: { include: { component: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              hamper: {
                include: {
                  box: true,
                  items: { include: { component: true } },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);

    if (dto.productId) {
      const prod = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!prod) throw new NotFoundException('Product not found');
      if (prod.stock < dto.quantity) throw new BadRequestException(`Only ${prod.stock} units left in stock`);
    }

    if (dto.hamperId) {
      const hamper = await this.prisma.hamper.findUnique({
        where: { id: dto.hamperId },
        include: { items: { include: { component: true } } },
      });
      if (!hamper) throw new NotFoundException('Hamper not found');
      for (const item of hamper.items) {
        if (item.component.stock < item.quantity * dto.quantity) {
          throw new BadRequestException(`Insufficient stock for component ${item.component.name}`);
        }
      }
    }

    const existingItem = cart.items.find(item => {
      if (dto.productId && item.productId === dto.productId && item.customizations === dto.customizations) return true;
      if (dto.hamperId && item.hamperId === dto.hamperId) return true;
      return false;
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        hamperId: dto.hamperId,
        quantity: dto.quantity,
        customizations: dto.customizations,
      },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  // 2. Checkout & Order Placement (Transaction)
  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    let subtotal = 0.0;
    const itemsToCreate: any[] = [];
    const stockUpdates: any[] = [];

    for (const item of cart.items) {
      if (item.product) {
        const prod = item.product;
        if (prod.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`);
        }

        let itemPrice = prod.price;
        if (item.customizations) {
          try {
            const parsed = JSON.parse(item.customizations);
            if (parsed.customOptionsPrice) {
              itemPrice += Number(parsed.customOptionsPrice);
            }
          } catch (e) {}
        }

        subtotal += itemPrice * item.quantity;
        itemsToCreate.push({
          productId: prod.id,
          hamperId: null,
          quantity: item.quantity,
          price: itemPrice,
          customizations: item.customizations,
          customStatus: prod.customizable ? 'PENDING_REVIEW' : null,
        });

        stockUpdates.push({
          type: 'PRODUCT',
          id: prod.id,
          quantity: item.quantity,
        });
      } else if (item.hamper) {
        const hamper = item.hamper;
        const itemsPrice = hamper.items.reduce((sum, hi) => sum + hi.component.price * hi.quantity, 0);
        const hamperPrice = hamper.box.price + itemsPrice;

        for (const hi of hamper.items) {
          if (hi.component.stock < hi.quantity * item.quantity) {
            throw new BadRequestException(`Insufficient stock for component ${hi.component.name}`);
          }
          stockUpdates.push({
            type: 'COMPONENT',
            id: hi.componentId,
            quantity: hi.quantity * item.quantity,
          });
        }

        subtotal += hamperPrice * item.quantity;
        itemsToCreate.push({
          productId: null,
          hamperId: hamper.id,
          quantity: item.quantity,
          price: hamperPrice,
          customizations: JSON.stringify({
            wrapping: hamper.wrapping,
            ribbonColor: hamper.ribbonColor,
            greetingMsg: hamper.greetingMsg,
            greetingImg: hamper.greetingImg,
          }),
          customStatus: (hamper.greetingMsg || hamper.greetingImg) ? 'PENDING_REVIEW' : null,
        });
      }
    }

    let discount = 0.0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (!coupon) {
        throw new BadRequestException(`Coupon code "${dto.couponCode}" is invalid`);
      }
      if (!coupon.isActive) {
        throw new BadRequestException(`Coupon code "${dto.couponCode}" is no longer active`);
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException(`Coupon code "${dto.couponCode}" has expired`);
      }
      if (coupon.type === 'PERCENTAGE') {
        discount = subtotal * (coupon.discount / 100);
      } else {
        discount = Math.min(coupon.discount, subtotal);
      }
    }

    const shipping = subtotal > 1500 ? 0.0 : 150.0;
    const total = subtotal - discount + shipping;

    const orderNumber = 'DIYAC-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: dto.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
          subtotalAmount: subtotal,
          discountAmount: discount,
          shippingAmount: shipping,
          totalAmount: total,
          shippingAddress: dto.shippingAddress,
          billingAddress: dto.billingAddress,
          couponCode: dto.couponCode,
        },
      });

      for (const item of itemsToCreate) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            hamperId: item.hamperId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations,
            customStatus: item.customStatus,
          },
        });
      }

      for (const update of stockUpdates) {
        if (update.type === 'PRODUCT') {
          await tx.product.update({
            where: { id: update.id },
            data: { stock: { decrement: update.quantity } },
          });
        } else if (update.type === 'COMPONENT') {
          await tx.hamperComponent.update({
            where: { id: update.id },
            data: { stock: { decrement: update.quantity } },
          });
        }
      }

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: dto.paymentMethod,
          amount: total,
          status: dto.paymentMethod === 'COD' ? 'SUCCESS' : 'PENDING',
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: true,
              hamper: { include: { box: true } },
            },
          },
          payments: true,
        },
      });
    });

    return order;
  }

  // 3. Customer Order Retrieval & Tracking
  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            hamper: { include: { box: true } },
          },
        },
        payments: true,
        shipments: true,
      },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            hamper: { include: { box: true } },
          },
        },
        payments: true,
        shipments: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Access denied to this order');

    return order;
  }

  async trackOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        shipments: true,
      },
    });

    if (!order) throw new NotFoundException('Order number not found');

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      updatedAt: order.updatedAt,
      shipment: order.shipments[0] || null,
    };
  }

  // 4. Admin Order Actions
  async getAdminOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: true,
            hamper: { include: { box: true } },
          },
        },
        payments: true,
        shipments: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string, adminId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shipments: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'order.update',
          details: `Updated order "${order.orderNumber}" status to "${status}"`,
        },
      });
    }

    if (status === 'SHIPPED' && order.shipments.length === 0) {
      const awb = 'AWB-' + Math.floor(100000 + Math.random() * 900000);
      const shipment = await this.prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: 'Delhivery',
          trackingNumber: 'TRK' + Date.now().toString().slice(-6),
          awb,
          status: 'SHIPPED',
        },
      });

      // Trigger shipping email alert
      try {
        const fullUser = await this.prisma.user.findUnique({ where: { id: order.userId } });
        if (fullUser && fullUser.email) {
          await this.notificationsService.sendShipmentTracking(fullUser.email, order, shipment);
        }
      } catch (err) {
        console.error('Failed to send shipment email notification', err);
      }
    }

    if (status === 'DELIVERED') {
      const shipment = await this.prisma.shipment.findFirst({ where: { orderId } });
      if (shipment) {
        await this.prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        });
      }
    }

    return updated;
  }

  private readonly logger = new Logger(OrdersService.name);

  // 5. Payment Gateway Webhook Handler (Verification)
  async processPaymentWebhook(dto: any, signature?: string) {
    if (process.env.PAYMENTS_ENABLED === 'false') {
      throw new BadRequestException('Online payments are currently disabled.');
    }
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const allowSandbox = process.env.ALLOW_SANDBOX_WEBHOOK === 'true';

    if (secret) {
      // STRICT MODE: secret is configured — signature MUST be present and valid
      if (!signature) {
        if (!isProduction && allowSandbox) {
          // Sandbox bypass allowed in non-production when explicitly enabled
          this.logger.warn(
            '[SANDBOX] Razorpay signature missing — bypassing verification (ALLOW_SANDBOX_WEBHOOK=true). ' +
            'This mode is NOT permitted in production.'
          );
        } else {
          throw new BadRequestException(
            'Razorpay webhook signature is required but was not provided.'
          );
        }
      } else {
        // Verify HMAC SHA-256 signature
        const bodyStr = typeof dto === 'string' ? dto : JSON.stringify(dto);
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(bodyStr)
          .digest('hex');

        if (expectedSignature !== signature) {
          this.logger.error(
            `Razorpay webhook signature mismatch. Expected: ${expectedSignature}, Received: ${signature}`
          );
          throw new BadRequestException('Razorpay signature verification failed');
        }
        this.logger.log('Razorpay webhook signature verified successfully.');
      }
    } else if (!isProduction && allowSandbox) {
      // No secret configured + sandbox mode: allow for local dev
      this.logger.warn(
        '[SANDBOX] No RAZORPAY_WEBHOOK_SECRET configured — processing webhook without verification. ' +
        'This is only permitted in development with ALLOW_SANDBOX_WEBHOOK=true.'
      );
    } else {
      // No secret and not sandbox mode — reject to prevent accidental unsecured webhooks in production
      throw new BadRequestException(
        'Webhook received but no RAZORPAY_WEBHOOK_SECRET is configured. ' +
        'Set RAZORPAY_WEBHOOK_SECRET or enable ALLOW_SANDBOX_WEBHOOK=true for development.'
      );
    }


    let orderId = dto.orderId;
    let transactionId = dto.transactionId;
    let isSuccess = dto.status === 'SUCCESS';

    // Parse Razorpay Webhook Payload structure
    if (dto.event && dto.payload?.payment?.entity) {
      const paymentEntity = dto.payload.payment.entity;
      transactionId = paymentEntity.id;
      isSuccess = paymentEntity.status === 'captured' || paymentEntity.status === 'verified';
      
      // Look up payment by transaction id (which stores Razorpay order id during checkout)
      const payRecord = await this.prisma.payment.findFirst({
        where: { transactionId: paymentEntity.order_id },
      });
      if (payRecord) {
        orderId = payRecord.orderId;
      }
    }

    if (!orderId) {
      throw new BadRequestException('Could not resolve order ID from webhook payload');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    // ── Idempotency Check ────────────────────────────────────────────────────
    // If order is already CONFIRMED (or beyond), this webhook was already processed
    const alreadyProcessedStatuses = ['CONFIRMED', 'CUSTOMIZATION_REVIEW', 'IN_PRODUCTION', 'QUALITY_CHECK', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (isSuccess && alreadyProcessedStatuses.includes(order.status)) {
      this.logger.warn(`Duplicate webhook received for already-confirmed order ${order.orderNumber}. Ignoring.`);
      return { success: true, message: 'Webhook already processed (idempotent)' };
    }

    const payment = order.payments[0];
    if (!payment) throw new NotFoundException('Payment record not found for this order');

    // ── Amount Validation ────────────────────────────────────────────────────
    if (dto.payload?.payment?.entity?.amount) {
      const webhookAmountPaise = Number(dto.payload.payment.entity.amount);
      const storedAmountPaise = Math.round(payment.amount * 100); // Convert rupees to paise
      const tolerance = 1; // Allow 1 paise tolerance for floating point
      if (Math.abs(webhookAmountPaise - storedAmountPaise) > tolerance) {
        this.logger.error(
          `Payment amount mismatch for order ${order.orderNumber}. ` +
          `Webhook: ${webhookAmountPaise} paise, Stored: ${storedAmountPaise} paise. Rejecting.`
        );
        throw new BadRequestException('Payment amount mismatch. Webhook rejected.');
      }
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        transactionId: transactionId || payment.transactionId,
      },
    });

    if (isSuccess) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      // Trigger order confirmation email alert
      try {
        const fullOrder = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: { include: { product: true } },
            payments: true,
          },
        });
        const fullUser = await this.prisma.user.findUnique({ where: { id: order.userId } });
        if (fullUser && fullUser.email && fullOrder) {
          await this.notificationsService.sendOrderConfirmation(fullUser.email, fullOrder);
        }
      } catch (err) {
        console.error('Failed to send order confirmation email notification', err);
      }
    }

    return { success: true, message: 'Webhook verified and processed successfully' };
  }

  async validateCoupon(code: string) {
    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new BadRequestException(`Coupon code "${code}" is invalid`);
    }
    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon code "${code}" is no longer active`);
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException(`Coupon code "${code}" has expired`);
    }
    return {
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      isActive: coupon.isActive,
    };
  }
}

