import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
