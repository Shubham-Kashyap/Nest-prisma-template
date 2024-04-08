import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const now = Date.now();
        const host = context.switchToHttp();
        const req = host.getRequest();
        const method = req.method;
        const url = req.url;
        return next.handle().pipe(
            tap({
                subscribe: () => {
                    Logger.debug(
                        ` ${method}  ${req.headers.host}${url}   ${Date.now() - now}ms`,
                        context.getClass().name
                    );
                    console.log({
                        method: req.method,
                        url: req.url,
                        headers: req.headers,
                        body: req.body,
                        query: req.query,
                        params: req.params
                    });
                },
                error: (error) =>
                    Logger.error(
                        `${method} ${url} ${Date.now() - now}ms ${JSON.stringify(error)}`,
                        context.getClass().name
                    )
            })
        );
    }
}
