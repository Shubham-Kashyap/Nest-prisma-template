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
}
