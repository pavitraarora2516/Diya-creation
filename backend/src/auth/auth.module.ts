import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // REQUIRED — validated at startup in main.ts
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any },
    }),
  ],
  providers: [AuthService, JwtStrategy, PermissionsGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PermissionsGuard, PassportModule, JwtModule],
})
export class AuthModule {}
