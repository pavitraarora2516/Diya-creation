import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorporateLeadDto, CreateQuotationDto } from './corporate.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CorporateService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createLead(dto: CreateCorporateLeadDto) {
    return this.prisma.corporateLead.create({
      data: {
        companyName: dto.companyName,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        gstDetails: dto.gstDetails,
        quantity: dto.quantity,
        budgetRange: dto.budgetRange,
        deliveryDate: new Date(dto.deliveryDate),
        requirements: dto.requirements,
      },
    });
  }

  async getLeads() {
    return this.prisma.corporateLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        quotations: true,
      },
    });
  }

  async updateLeadStatus(id: string, status: string) {
    const lead = await this.prisma.corporateLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Corporate lead not found');

    return this.prisma.corporateLead.update({
      where: { id },
      data: { status },
    });
  }

  async createQuotation(dto: CreateQuotationDto, adminId?: string) {
    const lead = await this.prisma.corporateLead.findUnique({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Corporate lead not found');

    let totalAmount = 0.0;
    try {
      const parsed = JSON.parse(dto.details);
      totalAmount = Number(parsed.totalAmount || 0.0);
    } catch (e) {
      throw new BadRequestException('Invalid quotation details JSON format');
    }

    const quoteNumber = 'DIYAC-QT-' + Date.now().toString().slice(-6) + '-' + Math.floor(10 + Math.random() * 90);

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quotation.create({
        data: {
          leadId: dto.leadId,
          quoteNumber,
          totalAmount,
          validUntil: new Date(dto.validUntil),
          details: dto.details,
        },
      });

      await tx.corporateLead.update({
        where: { id: dto.leadId },
        data: { status: 'QUOTED' },
      });

      if (adminId) {
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'quotation.create',
            details: `Published quotation "${quoteNumber}" for corporate lead "${lead.companyName}"`,
          },
        });
      }

      // Trigger quotation email notification
      try {
        if (lead.email) {
          await this.notificationsService.sendCorporateQuote(lead.email, lead.companyName, quote);
        }
      } catch (err) {
        console.error('Failed to send corporate quote email alert', err);
      }

      return quote;
    });
  }

  async getQuotationsByLead(leadId: string) {
    return this.prisma.quotation.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
