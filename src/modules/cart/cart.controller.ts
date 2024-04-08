import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import AuthRole from '@decorators/auth-role.decorator';
import { Controller, Delete, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import CartService from './cart.service';

@Controller('/cart')
@ApiTags('Cart')
export default class CartController {
    constructor(private cartService: CartService) {}

    /**
     * Add to cart
     * @param userId
     * @param productId
     * @param quantity
     * @returns
     */
    @Post('/add')
    @AuthRole(Role.User)
    async addToCart(
        @Query('userId') userId: string,
        @Query('productId') productId: string,
        @Query('quantity', ParseIntPipe) quantity: number
    ): Promise<ResponsePayload<null>> {
        await this.cartService.addToCart(userId, productId, quantity);
        return {
            message: MESSAGES.addToCart.success
        };
    }

    /**
     * Remove item from cart
     * @param cartId
     * @returns
     */
    @Delete('/delete')
    @AuthRole(Role.User)
    async removeToCart(@Query('cartId') cartId: string): Promise<ResponsePayload<null>> {
        await this.cartService.removeFromCart(cartId);
        return {
            message: MESSAGES.removeFromCart.success
        };
    }

    /**
     * Update cart items
     * @param cartId
     * @param quantity
     * @returns
     */
    @Put('/update')
    @AuthRole(Role.User)
    async updateCartItems(
        @Query('cartId') cartId: string,
        @Query('quantity', ParseIntPipe) quantity: number
    ): Promise<ResponsePayload<null>> {
        await this.cartService.updateCartItems(cartId, quantity);
        return {
            message: MESSAGES.updateCartItems.success
        };
    }
}
