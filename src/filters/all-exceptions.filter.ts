import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { errorResponse } from '@utilities/response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const { response, statusCode, body } = errorResponse(exception, host);
        response.status(statusCode).json(body);
    }
}
