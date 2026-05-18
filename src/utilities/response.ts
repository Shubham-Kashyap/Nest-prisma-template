import { ArgumentsHost, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { resolveLanguage, maybeTranslate } from '@utilities/i18n';
import { Request, Response } from 'express';

/**
 * -----------------------------------------------------------------------
 * Get Context Details
 * -----------------------------------------------------------------------
 * @param context
 * @returns
 */
export const getcontextData = (context: ExecutionContext): { response: Response; request: Request } => {
    const ctx = context.switchToHttp();
    return {
        response: ctx.getResponse<Response>(),
        request: ctx.getRequest<Request>()
    };
};

export const getHostContextData = (host: ArgumentsHost): { response: Response; request: Request } => {
    const ctx = host.switchToHttp();
    return {
        response: ctx.getResponse<Response>(),
        request: ctx.getRequest<Request>()
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
export const errorResponse = (exception: unknown, context: ExecutionContext | ArgumentsHost) => {
    const { request, response } =
        'switchToHttp' in context && !('getType' in context)
            ? getcontextData(context as ExecutionContext)
            : getHostContextData(context as ArgumentsHost);
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const language = resolveLanguage(request);
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const exceptionMessage =
        exception instanceof Error
            ? exception.message
            : typeof exception === 'string'
              ? exception
              : 'Internal server error';
    const translatedMessage =
        typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
            ? maybeTranslate((exceptionResponse as { message?: unknown }).message, language)
            : maybeTranslate(exceptionMessage, language);

    const responseBody: ApiResponse<unknown> = {
        status: false,
        statusCode,
        message: translatedMessage as string,
        ...(Boolean(Number(process.env.INCOMMING_REQUESTS_LOGGING)) && {
            path: request.url,
            details: statusCode !== HttpStatus.INTERNAL_SERVER_ERROR ? exceptionResponse : '',
            reason:
                exception instanceof Error
                    ? {
                          name: exception.name,
                          message: exception.message
                      }
                    : exception
        }),
        data: null
    };

    return {
        response,
        statusCode,
        body: responseBody
    };
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
    const { response, request } = getcontextData(context);
    const statusCode = response.statusCode;
    const language = resolveLanguage(request);

    response.setHeader('Content-Language', language);

    return {
        status: true,
        statusCode,
        message: maybeTranslate(res.message, language) as string,
        data: res.data ?? null
    } as ApiResponse<typeof res.data>;
};
