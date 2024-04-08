import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import OrderService from './order.service';
import AuthRole from 'src/decorators/auth-role.decorator';
import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';

@Controller('/order')
@ApiTags('Order')
@AuthRole(Role.User)
export default class OrderController {
    constructor(private orderService: OrderService) {}

    @Post('create')
    async placeOrder(
        @Query('userId') userId: string,
        @Query('totalAmount', ParseIntPipe) totalAmount: number,
        @Query('shippingAddressId') shippingAddressId: string
    ) {
        const data = await this.orderService.createOrder(userId, totalAmount, shippingAddressId);
        return {
            message: MESSAGES.createOrder.success,
            data
        };
    }

    @Get('user-order/list/:orderId')
    async userOrders(@Param('orderId') orderId: string) {
        const data = await this.orderService.userOrdersList(orderId);
        return {
            message: MESSAGES.userOrder.success,
            data
        };
    }
}
