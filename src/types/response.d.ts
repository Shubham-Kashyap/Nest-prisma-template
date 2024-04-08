interface ApiResponse<T> {
    status: boolean;
    statusCode: number;
    message: string;
    type?: string;
    data?: T;
}

type ResponsePayload<T> = Pick<ApiResponse<T>, 'message' | 'data'>;
