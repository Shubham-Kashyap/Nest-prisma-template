import { MESSAGES } from '@constants/messages';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export default class CartService {
    constructor(private readonly prismaService: PrismaService) {}

    async checkCartItem(params: { cartId?: string; productId?: string; userId?: string }) {
        const { cartId, productId, userId } = params;
        return this.prismaService.cart.findFirst({
            where: {
                id: cartId,
                productId,
                userId
            }
        });
    }

    async addToCart(userId: string, productId: string, quantity: number) {
        const alreadyExists = await this.checkCartItem({ userId, productId });
        if (alreadyExists) throw new BadRequestException({ message: MESSAGES.addToCart.error.alreadyExists });

        await this.prismaService.cart.create({
            data: {
                userId,
                productId,
                quantity
            }
        });
    }

    async removeFromCart(cartId: string) {
        const alreadyExists = await this.checkCartItem({ cartId });
        if (!alreadyExists) throw new BadRequestException({ message: MESSAGES.removeFromCart.error.notFound });
        await this.prismaService.cart.delete({ where: { id: cartId } });
    }

    async updateCartItems(cartId: string, quantity: number) {
        const alreadyExists = await this.checkCartItem({ cartId });
        if (!alreadyExists) throw new BadRequestException({ message: MESSAGES.updateCartItems.error.notFound });

        await this.prismaService.cart.update({
            where: { id: cartId },
            data: {
                quantity
            }
        });
    }

    async clearCart(userId: string) {
        await this.prismaService.cart.deleteMany({
            where: { userId }
        });
    }
}
