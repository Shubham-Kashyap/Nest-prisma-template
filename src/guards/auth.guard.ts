import { ResponseInterceptor } from '@interceptor/response.interceptor';
import { CanActivate, ExecutionContext, Injectable, UseInterceptors } from '@nestjs/common';
import { JwtTokenService } from '@services/jwt-token.service';
import { errorResponse, getcontextData } from '@utilities/response';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class AuthGuard implements CanActivate {
    constructor(private jwtTokenService: JwtTokenService) {}

    validateToken(request: Request): boolean {
        const accessToken = request.headers['authorization']?.split(' ')[1] ?? undefined;
        //  TODO  :add user cred  verification as well here
        if (this.jwtTokenService.decrypt(accessToken)) return true;
        else return false;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const { request } = getcontextData(context);
        try {
            return this.validateToken(request);
        } catch (error) {
            errorResponse(error, context);
        }
    }
}
