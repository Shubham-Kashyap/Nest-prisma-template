import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const className = context.getClass().name;
        const handlerName = context.getHandler().name;
        const separator = '\x1b[36m' + '⎯'.repeat(50) + '\x1b[0m';
        const title = '\x1b[33m' + `📝 Request Details: [${method}] => ${url}:` + '\x1b[0m';

        return next.handle().pipe(
            tap({
                subscribe: () => {
                    Logger.debug(`🚀 INCOMING: [${method}] ${url} - ${className}#${handlerName}`, 'LoggingInterceptor');

                    const requestDetails = {
                        Headers: req.headers,
                        Query: Object.keys(req.query).length ? req.query : undefined,
                        Params: Object.keys(req.params).length ? req.params : undefined,
                        Body: Object.keys(req.body).length ? req.body : undefined
                    };
                    console.log(separator);
                    console.log(title);
                    console.dir(requestDetails, { depth: null, colors: true });
                    console.log(separator);
                },
                next: () => {
                    const duration = Date.now() - now;
                    Logger.log(`✅ SUCCESS: [${method}] ${url} (+${duration}ms)`, 'LoggingInterceptor');
                },
                error: (error) => {
                    const duration = Date.now() - now;
                    const statusCode = error.status || 500;
                    Logger.error(
                        `❌ ERROR: [${method}] ${url} [${statusCode}] (+${duration}ms) - ${JSON.stringify(error.message || error)}`,
                        'LoggingInterceptor'
                    );
                }
            })
        );
    }
}
