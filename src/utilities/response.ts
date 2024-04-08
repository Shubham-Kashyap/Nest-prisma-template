import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

/**
 * -----------------------------------------------------------------------
 * Get Context Details
 * -----------------------------------------------------------------------
 * @param context
 * @returns
 */
export const getcontextData = (context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    return {
        response: ctx.getResponse(),
        request: ctx.getRequest()
    };
};

/**
 * -----------------------------------------------------------------------
 * Error Response
 * -----------------------------------------------------------------------
 * @param exception
 * @param context
 * @returns
 */
export const errorResponse = (exception: HttpException, context: ExecutionContext) => {
    const { request, response } = getcontextData(context);
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: ApiResponse<unknown> = {
        status: false,
        statusCode,
        message: exception.message,
        ...(Boolean(Number(process.env.INCOMMING_REQUESTS_LOGGING)) && {
            path: request.url,
            details: statusCode !== HttpStatus.INTERNAL_SERVER_ERROR ? exception.getResponse() : '',
            reason: exception
        }),
        data: null
    };
    return response.status(statusCode).json(responseBody);
};

/**
 * -----------------------------------------------------------------------
 * Success Response
 * -----------------------------------------------------------------------
 * @param {{message : string , data : unknown}} res
 * @param {ExecutionContext} context
 * @returns
 */
export const successResponse = (res: { message: string; data: unknown }, context: ExecutionContext) => {
    const { response } = getcontextData(context);
    const statusCode = response.statusCode;

    return {
        status: true,
        statusCode,
        message: res.message,
        data: res.data ?? null
    } as ApiResponse<typeof res.data>;
};
