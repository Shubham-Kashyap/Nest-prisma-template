import { MESSAGES } from '@constants/messages';
import { API_PROPERTIES } from '@constants/swagger';
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
// import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { getcontextData } from '@utilities/response';

export default createParamDecorator(
    (_data: unknown, context: ExecutionContext): PaginationParams => {
        const { request } = getcontextData(context);
        const page = parseInt(request.query.page as string);
        const size = parseInt(request.query.size as string);

        /** Check if page and size are valid */
        if ((request.query.page || request.query.size) && (isNaN(page) || page < 0 || isNaN(size) || size < 0))
            throw new BadRequestException(MESSAGES.pagination.error.invalidParams);

        /** Do not allow to fetch large slices of the dataset */
        if (size > 100) throw new BadRequestException(MESSAGES.pagination.error.minSize);

        /** pagination parameters */
        return {
            page,
            size,
            limit: size,
            offset: (page - 1) * size
        };
    },
    [
        (target, key) => {
            // Here it is. Use the `@ApiQuery` decorator purely as a function to define the meta only once here.
            ApiQuery({ name: 'page', required: false, type: Number, description: API_PROPERTIES.pagination.page })(
                target,
                key,
                Object.getOwnPropertyDescriptor(target, key)
            );
            ApiQuery({ name: 'size', required: false, type: Number, description: API_PROPERTIES.pagination.size })(
                target,
                key,
                Object.getOwnPropertyDescriptor(target, key)
            );
        }
    ]
);
