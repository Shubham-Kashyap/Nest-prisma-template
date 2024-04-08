import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import AuthRole from 'src/decorators/auth-role.decorator';

import { ProductService } from '../../shared/service/products.service';
import { EditProductDto } from './dto/editProduct.dto';

@Controller('/product')
@ApiTags('Products')
@AuthRole(Role.Admin)
export class ProductController {
    constructor(private productService: ProductService) {}

    /**
     * Delete product
     * @param {string} productId
     * @returns
     */
    @Delete('/delete/:productId')
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
