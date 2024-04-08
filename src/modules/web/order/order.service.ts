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

        return { ...createdOrder };
    }

    async userOrdersList(orderId: string) {
        return await this.prismaService.$queryRaw`
            SELECT 
                'id', o.id,
                'orderAmount', o.order_amount,
                'deliveryStatus', o.delivery_status,
                JSON_OBJECT(
                    'id', u.id,
                    'firstName', u.first_name,
                    'lastName', u.last_name
                ) as user,
                JSON_OBJECT(
                    'id', s.id,
                    'name', s.name,
                    'street', s.street,
                    'city', s.city,
                    'zip',s.zip,
                    'country',s.country
                ) as shippingAddress,
                JSON_ARRAYAGG(JSON_OBJECT(
                        'id', p.id,
                        'title', p.title,
                        'stock',p.stock,
                        'thumbnail',p.thumbnail,
                        'description',p.description,
                        'brand',p.brand,
                        'category', JSON_OBJECT(
                            'id', c.id,
                            'name', c.name,
                            'description', c.description
                        ),
                        'images', (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'id', i.id,
                            'url', i.url
                        )) FROM images i WHERE i.product_id = p.id),
                        'reviews', (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                            'id', r.id,
                            'comment', r.comment
                        )) FROM reviews r WHERE r.product_id = p.id)
                    )
                ) as products
                                              
            FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN shipping_addresses s ON o.shipping_address_id = s.id
                LEFT JOIN order_products op ON o.id = op.order_id
                LEFT JOIN products p ON op.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
            WHERE o.id = ${orderId}
            GROUP BY o.id;

        `;
    }
}
