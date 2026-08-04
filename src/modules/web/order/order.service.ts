import { MESSAGES } from '@constants/messages';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export default class OrderService {
    constructor(private readonly prismaService: PrismaService) {}

    async getCartItems(userId: string) {
        return this.prismaService.cart.findMany({
            where: { userId },
            include: {
                user: {
                    include: {
                        shippingAddress: true
                    }
                },
                product: {
                    include: {
                        category: true,
                        images: true,
                        reviews: true,
                        highlights: true,
                        specifications: true
                    }
                }
            }
        });
    }

    async createOrder(userId: string, orderAmount?: number, shippingAddressId?: string) {
        const cartItems = await this.getCartItems(userId);

        if (!cartItems.length) {
            throw new BadRequestException({ message: MESSAGES.createOrder.exception.emptyCart });
        }

        if (!shippingAddressId) {
            throw new BadRequestException({ message: MESSAGES.createOrder.exception.shippingAddressRequired });
        }

        const createdOrder = await this.prismaService.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    deliveryStatus: DeliveryStatus.PENDING,
                    orderAmount: orderAmount || 0,
                    userId,
                    shippingAddressId: shippingAddressId,
                    products: {
                        create: cartItems.map((item) => ({
                            productId: item.productId
                        }))
                    }
                }
            });

            await tx.cart.deleteMany({
                where: { userId }
            });

            return order;
        });

        return this.userOrdersList(createdOrder.id);
    }

    async userOrdersList(orderId: string) {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    include: {
                        shippingAddress: true
                    }
                },
                shippingAddress: true,
                products: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                images: true,
                                reviews: true,
                                highlights: true,
                                specifications: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            throw new NotFoundException({ message: MESSAGES.userOrder.error.notFound });
        }

        return order;
    }
}
