import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access Denied: User role details not found');
    }

    // Super Admins automatically bypass permission checks
    if (user.role.name === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = user.role.permissions.map((p: any) => p.name);
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Access Denied: Insufficient Permissions');
    }

    return true;
  }
}
