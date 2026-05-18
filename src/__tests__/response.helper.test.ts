import { HttpException, HttpStatus } from '@nestjs/common';

describe('Response Structure', () => {
  const buildErrorResponse = (exception: HttpException) => {
    return {
      statusCode: exception.getStatus(),
      body: {
        status: false,
        message: exception.message,
      },
    };
  };

  const buildSuccessResponse = (payload: any) => {
    return {
      status: true,
      message: payload.message,
      data: payload.data,
    };
  };

  it('should build error response with proper status', () => {
    const exception = new HttpException(
      'Not Found',
      HttpStatus.NOT_FOUND,
    );

    const result = buildErrorResponse(exception);

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);

    expect(result.body.status).toBe(false);

    expect(result.body.message).toBe('Not Found');
  });

  it('should build success response', () => {
    const payload = {
      message: 'ok',
      data: { a: 1 },
    };

    const result = buildSuccessResponse(payload);

    expect(result.status).toBe(true);

    expect(result.message).toBe('ok');

    expect(result.data).toEqual({ a: 1 });
  });
});