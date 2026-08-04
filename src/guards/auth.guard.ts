import { ResponseInterceptor } from '@interceptor/response.interceptor';
import { CanActivate, ExecutionContext, Injectable, UseInterceptors } from '@nestjs/common';
import { RedisService } from '@services/cache/redis.service';
import { JwtTokenService } from '@services/jwt-token.service';
import { PrismaService } from '@services/prisma.service';
import { getJitteredTTL } from '@utilities/datetime';
import { errorResponse, getcontextData } from '@utilities/response';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class AuthGuard implements CanActivate {
    constructor(private jwtTokenService: JwtTokenService, private redisService: RedisService,private prismaService: PrismaService) {}

    protected async validateToken(request: Request): Promise<boolean> {
        const accessToken = request.headers['authorization']?.split(' ')[1];
        if (!accessToken) return false;

        const decodedPayload = this.jwtTokenService.decrypt(accessToken);
        if (!decodedPayload || !decodedPayload.userId) return false;

        // Cache first approach
        const cacheKey = `token:${decodedPayload.userId}`;
        const cachedUserData = await this.redisService.get(cacheKey);
        if (cachedUserData) {
            request['user']= cachedUserData
            return true
        }
        // if token is not found in cache, check in db
        const user = await this.prismaService.user.findUnique({
            where: { id: decodedPayload.userId, accessToken, email:decodedPayload.email },
            select: {
                id: true,
                email: true,
                role: true,
            }
        });
        if(!user) return false;
        // adding jittered ttl to eliminate thundering herd problem
        const ttl = getJitteredTTL(decodedPayload.exp)
        await this.redisService.set(`token:${decodedPayload.userId}`, user,ttl);

        request['user'] = user
        return true;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const { request } = getcontextData(context);
        try {
            return this.validateToken(request);
        } catch (error) {
            errorResponse(error, context);
            return false;
        }
    }
}
