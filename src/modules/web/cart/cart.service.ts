import { MESSAGES } from '@constants/messages';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export default class CartService {
    constructor(private prismaService: PrismaService) {}

    async checkCartItem({
        cartId,
        productId,
        userId
    }: {
        cartId?: string;
        productId?: string;
        userId?: string;
    }): Promise<unknown> {
        return await this.prismaService.cart.findFirst({
            where: {
                ...(cartId && productId && { id: cartId, productId }),
                ...(userId && productId && { userId, productId }),
                ...(cartId && { id: cartId }),
                ...(userId && { userId })
            }
        });
    }

    async addToCart(userId: string, productId: string, quantity: number) {
        const alreadyExsist = await this.checkCartItem({ userId, productId });
        if (alreadyExsist) throw new BadRequestException({ message: MESSAGES.addToCart.error.alreadyExsist });
        return await this.prismaService.cart.create({
            data: {
                userId,
                productId,
                quantity
            }
        });
    }

    async removeFromCart(cartId: string) {
        const alreadyExsist = await this.checkCartItem({ cartId });
        if (alreadyExsist) throw new BadRequestException({ message: MESSAGES.removeFromCart.error.notFound });
        return await this.prismaService.cart.delete({
            where: {
                id: cartId
            }
        });
    }

    async updateCartItems(cartId: string, quantity: number) {
        const alreadyExsist = await this.checkCartItem({ cartId });
        if (!alreadyExsist) throw new BadRequestException({ message: MESSAGES.updateCartItems.error.notFound });
        return await this.prismaService.cart.update({
            where: {
                id: cartId
            },
            data: { quantity }
        });
    }
}
