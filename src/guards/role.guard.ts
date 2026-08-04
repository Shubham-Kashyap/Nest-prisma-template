import { Role } from '@constants/enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from '@services/jwt-token.service';
import { errorResponse, getcontextData } from '@utilities/response';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtTokenService: JwtTokenService
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const { request } = getcontextData(context);
            const token = request.headers['authorization']?.split(' ')[1];
            if (!token) return false;

            const decoded = this.jwtTokenService.decode(token);
            if (!decoded || !decoded.payload) return false;
            const { payload } = decoded;

            const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
                context.getHandler(),
                context.getClass()
            ]);
            // TODO :  add or modify role based access control here
            /** Role Based Access Control (RBAC) */
            if (!requiredRoles || requiredRoles.some((role) => [payload['role']].includes(role))) return true;
            return false;
        } catch (error) {
            errorResponse(error, context);
            return false;
        }
    }
}
