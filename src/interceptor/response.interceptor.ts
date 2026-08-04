import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { successResponse } from '@utilities/response';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(map((res: { message: string; data: unknown }) => successResponse(res, context)));
    }
}
