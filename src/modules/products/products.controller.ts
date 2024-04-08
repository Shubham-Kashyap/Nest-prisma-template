import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import AuthRole from '@decorators/auth-role.decorator';
import Pagination from '@decorators/pagination.decorator';
import ProductFilter from '@decorators/product-filter.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { paginationMetaData } from '@utilities/pagination';

import { EditProductDto } from './dto/editProduct.dto';
import { ProductService } from './products.service';

@Controller('/product')
@ApiTags('Products')
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
     * Delete product
     * @param {string} productId
     * @returns
     */
    @Delete('/delete/:productId')
    @AuthRole(Role.Admin)
    async deleteProduct(@Param('productId') productId: string) {
        await this.productService.deleteProduct(productId);
        return {
            message: MESSAGES.deleteProduct.success
        };
    }

    /**
     * Edit product
     * @param {string} productId
     * @param {EditProductDto} data
     * @returns
     */
    @Put('/edit/:productId')
    @AuthRole(Role.Admin)
    async editProduct(@Param('productId', ParseIntPipe) productId: string, @Body() data: EditProductDto) {
        await this.productService.updateProduct(productId, data);
        return {
            message: MESSAGES.editProduct.success
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
