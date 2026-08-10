import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const validStatuses = ['CONFIRMED', 'PRODUCTION', 'PACKED', 'SHIPPED', 'DELIVERED'];

    const todayOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: today },
        status: { in: validStatuses },
      },
      select: { totalAmount: true },
    });

    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth },
        status: { in: validStatuses },
      },
      select: { totalAmount: true },
    });

    const allConfirmedOrders = await this.prisma.order.findMany({
      where: { status: { in: validStatuses } },
      select: { totalAmount: true },
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = allConfirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrdersCount = await this.prisma.order.count();
    const pendingOrdersCount = await this.prisma.order.count({
      where: { status: 'CONFIRMED' },
    });

    const pendingCustomizationsCount = await this.prisma.orderItem.count({
      where: { customStatus: 'PENDING_REVIEW' },
    });

    const lowStockProducts = await this.prisma.product.count({
      where: { stock: { lt: 10, gt: 0 } },
    });
    const outOfStockProducts = await this.prisma.product.count({
      where: { stock: 0 },
    });

    const lowStockComponents = await this.prisma.hamperComponent.count({
      where: { stock: { lt: 15, gt: 0 } },
    });
    const outOfStockComponents = await this.prisma.hamperComponent.count({
      where: { stock: 0 },
    });

    const lowStockCount = lowStockProducts + lowStockComponents;
    const outOfStockCount = outOfStockProducts + outOfStockComponents;

    const corporateLeadsCount = await this.prisma.corporateLead.count();

    const confirmedCount = allConfirmedOrders.length;
    const aov = confirmedCount > 0 ? totalRevenue / confirmedCount : 0.0;

    const customerRole = await this.prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
    const customerCount = customerRole
      ? await this.prisma.user.count({ where: { roleId: customerRole.id } })
      : 0;

    const orderItems = await this.prisma.orderItem.findMany({
      where: { order: { status: { in: validStatuses } }, productId: { not: null } },
      select: {
        productId: true,
        quantity: true,
        price: true,
        product: { select: { name: true } },
      },
    });

    const productSalesMap: Record<string, { name: string; quantity: number; sales: number }> = {};
    for (const item of orderItems) {
      if (item.productId && item.product) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.product.name,
            quantity: 0,
            sales: 0,
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].sales += item.quantity * item.price;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      todaySales,
      monthlySales,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      pendingCustomizations: pendingCustomizationsCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      corporateLeads: corporateLeadsCount,
      revenue: totalRevenue,
      aov,
      customerGrowth: customerCount,
      topProducts,
    };
  }

  async getCustomizationQueue() {
    return this.prisma.orderItem.findMany({
      where: {
        customStatus: { not: null },
      },
      include: {
        product: true,
        hamper: { include: { box: true } },
        order: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  async updateCustomizationStatus(itemId: string, status: string, adminId?: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!item) {
      throw new NotFoundException('OrderItem not found');
    }

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { customStatus: status },
    });

    if (adminId && item.order) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'customization.review',
          details: `Reviewed personalization item ID ${itemId} for order "${item.order.orderNumber}". Status set to "${status}"`,
        },
      });
    }

    return updated;
  }
}
