import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Retrieve or create CUSTOMER role
    let customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: { name: 'CUSTOMER' },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        roleId: customerRole.id,
      },
      include: {
        role: true,
      },
    });

    // Automatically create empty cart for the user
    await this.prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email: email };
    return this.jwtService.sign(payload);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If this email is registered, you will receive a reset link.' };
    }

    // Generate a secure 32-byte reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in Settings table as "password_reset:{email}" → "{token}|{expiry}"
    await this.prisma.setting.upsert({
      where: { key: `password_reset:${email}` },
      update: { value: `${token}|${expiresAt.toISOString()}` },
      create: { key: `password_reset:${email}`, value: `${token}|${expiresAt.toISOString()}` },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // In production: send email with reset URL
    // TODO: integrate with NotificationsService for email sending
    console.log(`[PASSWORD RESET] URL for ${email}: ${resetUrl}`);

    // Only return token in non-production for testability
    const responsePayload: any = { message: 'If this email is registered, you will receive a reset link.' };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.debug_reset_token = token; // Remove in prod
      responsePayload.debug_reset_url = resetUrl;
    }
    return responsePayload;
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!email || !token || !newPassword) {
      throw new BadRequestException('Email, token, and new password are required');
    }

    const setting = await this.prisma.setting.findUnique({
      where: { key: `password_reset:${email}` },
    });

    if (!setting) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const [storedToken, expiryStr] = setting.value.split('|');
    if (storedToken !== token) {
      throw new BadRequestException('Invalid password reset token');
    }
    if (new Date(expiryStr) < new Date()) {
      throw new BadRequestException('Password reset token has expired. Please request a new one.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Invalidate the token after use
    await this.prisma.setting.delete({ where: { key: `password_reset:${email}` } });

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }
}
