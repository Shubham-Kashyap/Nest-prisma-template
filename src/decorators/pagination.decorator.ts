import { MESSAGES } from '@constants/messages';
import { PageSize } from '@constants/enum';
import { API_PROPERTIES } from '@constants/swagger';
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { getcontextData } from '@utilities/response';

export default createParamDecorator(
    (_data: unknown, context: ExecutionContext): PaginationParams => {
        const { request } = getcontextData(context);
        const page = request.query.page ? parseInt(request.query.page as string) : 1;
        const size = request.query.size ? parseInt(request.query.size as string) : PageSize.Min;

        /** Check if page and size are valid */
        if ((request.query.page || request.query.size) && (isNaN(page) || page <= 0 || isNaN(size) || size <= 0))
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
        (target: object, key?: string | symbol) => {
            if (!key) return;
            // Here it is. Use the `@ApiQuery` decorator purely as a function to define the meta only once here.
            ApiQuery({ name: 'page', required: false, type: Number, description: API_PROPERTIES.pagination.page })(
                target,
                key as string | symbol,
                Object.getOwnPropertyDescriptor(target, key) as PropertyDescriptor
            );
            ApiQuery({ name: 'size', required: false, type: Number, description: API_PROPERTIES.pagination.size })(
                target,
                key as string | symbol,
                Object.getOwnPropertyDescriptor(target, key) as PropertyDescriptor
            );
        }
    ]
);
