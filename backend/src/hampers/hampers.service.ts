import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHamperBoxDto, CreateHamperComponentDto, BuildHamperDto } from './hampers.dto';

@Injectable()
export class HampersService {
  constructor(private prisma: PrismaService) {}

  // Box Styles
  async getBoxes() {
    return this.prisma.hamperBox.findMany();
  }

  async createBox(dto: CreateHamperBoxDto) {
    return this.prisma.hamperBox.create({ data: dto });
  }

  // Box Components
  async getComponents() {
    return this.prisma.hamperComponent.findMany();
  }

  async createComponent(dto: CreateHamperComponentDto) {
    return this.prisma.hamperComponent.create({ data: dto });
  }

  // Build Custom Hamper (Transaction)
  async buildHamper(dto: BuildHamperDto) {
    const box = await this.prisma.hamperBox.findUnique({
      where: { id: dto.boxId },
    });

    if (!box) {
      throw new NotFoundException('Selected hamper box not found');
    }

    // Verify box capacity limits
    const totalItemsCount = dto.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItemsCount > box.capacity) {
      throw new BadRequestException(
        `Selected items count (${totalItemsCount}) exceeds box capacity (${box.capacity})`,
      );
    }

    let totalItemsPrice = 0.0;

    for (const item of dto.items) {
      const comp = await this.prisma.hamperComponent.findUnique({
        where: { id: item.componentId },
      });

      if (!comp) {
        throw new NotFoundException(`Hamper component with ID ${item.componentId} not found`);
      }

      if (comp.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for component ${comp.name}. Available: ${comp.stock}`);
      }

      totalItemsPrice += comp.price * item.quantity;
    }

    const totalPrice = box.price + totalItemsPrice;

    const hamper = await this.prisma.$transaction(async (tx) => {
      const newHamper = await tx.hamper.create({
        data: {
          boxId: dto.boxId,
          wrapping: dto.wrapping || 'Standard Wrapping',
          ribbonColor: dto.ribbonColor || 'Gold',
          greetingMsg: dto.greetingMsg,
          greetingImg: dto.greetingImg,
        },
      });

      for (const item of dto.items) {
        await tx.hamperItem.create({
          data: {
            hamperId: newHamper.id,
            componentId: item.componentId,
            quantity: item.quantity,
          },
        });
      }

      return tx.hamper.findUnique({
        where: { id: newHamper.id },
        include: {
          box: true,
          items: {
            include: {
              component: true,
            },
          },
        },
      });
    });

    return {
      hamper,
      totalPrice,
    };
  }

  // Get Hamper Details & Calculate Price
  async getHamperDetails(id: string) {
    const hamper = await this.prisma.hamper.findUnique({
      where: { id },
      include: {
        box: true,
        items: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!hamper) {
      throw new NotFoundException('Custom hamper not found');
    }

    const itemsPrice = hamper.items.reduce((sum, item) => sum + item.component.price * item.quantity, 0);
    const totalPrice = hamper.box.price + itemsPrice;

    return {
      hamper,
      totalPrice,
    };
  }
}
