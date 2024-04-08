import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { errorResponse, successResponse } from '@utilities/response';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            map((res: { message: string; data: unknown }) => successResponse(res, context)),
            catchError((err: HttpException) => throwError(() => errorResponse(err, context)))
        );
    }
}
