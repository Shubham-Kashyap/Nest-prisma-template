import { MESSAGES } from '@constants/messages';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async userDetails(userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isEmailVerified: true,
                role: true,
                userToken: true,
                shippingAddress: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new NotFoundException({ message: MESSAGES.userDetails.error.notFound });
        }

        return user;
    }

    async blockUser(userId: string) {
        try {
            return await this.prismaService.user.update({
                where: { id: userId },
                data: { isEmailVerified: false },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    isEmailVerified: true,
                    role: true,
                    userToken: true,
                    shippingAddress: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        } catch {
            throw new NotFoundException({ message: MESSAGES.blockUser.exception.notFound });
        }
    }

    async unblockUser(userId: string) {
        try {
            return await this.prismaService.user.update({
                where: { id: userId },
                data: { isEmailVerified: true },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    isEmailVerified: true,
                    role: true,
                    userToken: true,
                    shippingAddress: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        } catch {
            throw new NotFoundException({ message: MESSAGES.unblockUser.exception.notFound });
        }
    }
}
