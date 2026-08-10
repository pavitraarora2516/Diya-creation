import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Strict rate limit: 5 requests per minute per IP (brute-force protection)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Strict rate limit: 5 requests per minute per IP
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Skip throttle for profile (authenticated read — low risk)
  @SkipThrottle()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      permissions: user.role.permissions.map((p: any) => p.name),
    };
  }

  // Strict rate limit: 3 per 15 minutes (prevent email spam)
  @Throttle({ default: { ttl: 900000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // Strict rate limit: 5 per 15 minutes
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, token, newPassword);
  }
}

