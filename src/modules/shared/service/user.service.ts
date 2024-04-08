import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export default class UserService {
    constructor(private prismaService: PrismaService) {}

    async userDetails(userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, updatedAt, createdAt, ...data } = await this.prismaService.user.findFirst({
            where: {
                id: userId
            },
            include: {}
        });
        return data;
    }

    /**
     * Block user
     * @param userId
     * @returns
     */
    async blockUser(userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                isEmailVerified:
                    false /** here i ve user is_email_verified but you can use is_blocked to block  user as you want */
            }
        });
    }

    /**
     * Unblock user
     * @param userId
     * @returns
     */
    async unblockUser(userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                isEmailVerified:
                    true /** here i ve user is_email_verified but you can use is_blocked to block  user as you want */
            }
        });
    }
}
