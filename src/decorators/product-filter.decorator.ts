import { MESSAGES } from '@constants/messages';
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getcontextData } from '@utilities/response';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';

export default createParamDecorator(
    (_data, context: ExecutionContext): ProductFilter => {
        const { request } = getcontextData(context);
        const category = request.query.category as string;
        const minPrice = parseInt(request.query.minPrice as string);
        const maxPrice = parseInt(request.query.maxPrice as string);
        const rating = parseInt(request.query.rating as string);

        /** Check if price-range are valid */
        if (
            (request.query.minPrize || request.query.maxPrize) &&
            (isNaN(minPrice) || minPrice < 0 || isNaN(maxPrice) || maxPrice < 0)
        )
            throw new BadRequestException(MESSAGES.productFilter.error.invalidPriceRange);
        else if (request.query.rating && (isNaN(rating) || rating < 0))
            throw new BadRequestException(MESSAGES.productFilter.error.invalidRating);

        /** product filter parameters */
        return {
            category,
            priceRange: { min: minPrice, max: maxPrice },
            rating
        };
    },
    [
        (target, key) => {
            // Here we will define query parameter for swagger documentation
            Reflect.defineMetadata(
                DECORATORS.API_PARAMETERS,
                [
                    ...(Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[key]) ?? []),
                    {
                        name: 'category',
                        required: false,
                        in: 'query',
                        type: String,
                        default: DEFAULT_VALUES.category.name,
                        description: API_PROPERTIES.product.filters.category
                    },
                    {
                        name: 'minPrice',
                        required: false,
                        in: 'query',
                        type: Number,
                        default: DEFAULT_VALUES.product.minPrice,
                        description: API_PROPERTIES.product.filters.minPrice
                    },
                    {
                        name: 'maxPrice',
                        required: false,
                        in: 'query',
                        type: Number,
                        default: DEFAULT_VALUES.product.maxPrice,
                        description: API_PROPERTIES.product.filters.maxPrice
                    },
                    {
                        name: 'rating',
                        required: false,
                        in: 'query',
                        type: Number,
                        default: DEFAULT_VALUES.product.rating,
                        description: API_PROPERTIES.product.filters.rating
                    }
                ],
                target[key]
            );
        }
    ]
);
