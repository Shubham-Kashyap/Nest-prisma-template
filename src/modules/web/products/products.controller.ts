import { MESSAGES } from '@constants/messages';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { paginationMetaData } from '@utilities/pagination';
import Pagination from 'src/decorators/pagination.decorator';
import ProductFilter from 'src/decorators/product-filter.decorator';

import { ProductService } from '../../shared/service/products.service';
import AuthRole from '@decorators/auth-role.decorator';
import { Role } from '@constants/enum';

@Controller('/product')
@ApiTags('Products')
@AuthRole(Role.User)
export class ProductController {
    constructor(private productService: ProductService) {}

    /**
     * Product list
     * @param {string} page
     * @param {string} size
     * @returns
     */
    @Get('/list')
    async productsList(
        @ProductFilter() filterOptions: ProductFilter,
        @Pagination()
        { limit, offset, page }: PaginationParams
    ) {
        const { data, count } = await this.productService.getProducts(limit, offset, filterOptions);
        return {
            message: 'Products list',
            data: {
                records: data,
                metaData: paginationMetaData(count, page, limit)
            }
        };
    }

    /**
     * Edit product
     * @param {string} productId
     * @param {EditProductDto} data
     * @returns
     */
    @Get('/details/:productId')
    async productDetails(@Param('productId') productId: string) {
        const data = await this.productService.getProductDetails(productId);
        return {
            message: MESSAGES.getProduct.success,
            data
        };
    }
}
