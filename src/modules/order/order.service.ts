import { MESSAGES } from '@constants/messages';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';
// import { DeliveryStatus } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export default class OrderService {
    constructor(private prismaService: PrismaService) {}

    async getCartItems(userId: string) {
        return await this.prismaService.cart.findMany({
            where: {
                userId
            },
            include: {
                user: true,
                product: true
            }
        });
    }

    async createOrder(userId: string, orderAmount?: number, shippingAddressId?: string) {
        const cartItems = await this.getCartItems(userId);
        if (!cartItems) throw new BadRequestException({ message: MESSAGES.createOrder.exception.emptyCart });
        const createdOrder = await this.prismaService.order.create({
            data: {
                deliveryStatus: DeliveryStatus.PENDING,
                orderAmount,
                userId,
                shippingAddressId: shippingAddressId
            }
        });

        await cartItems?.map(async (item) => {
            await this.prismaService.orderProduct.create({
                data: {
                    orderId: createdOrder.id,
                    productId: item.productId
                }
            });
        });

        return { cartItems, createdOrder };
    }

    async userOrdersList(orderId: string) {
        return await this.prismaService.order.findMany({
            where: {
                id: orderId
            },
            include: {
                user: true,
                products: true
            }
        });
    }
}
