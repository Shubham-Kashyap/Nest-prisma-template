/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from '@prisma/client';

import { userData } from './userData';

const prisma = new PrismaClient();

export default async () => {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        await Promise.all(
            userData.map(async (user) => {
                const { shippingAddress, ...data } = user;
                const createdUser = await prisma.user.create({ data: { ...(data as Prisma.UserCreateManyInput) } });
                await prisma.shippingAddress.createMany({
                    data: shippingAddress.map((addr) => ({
                        ...addr,
                        userId: createdUser.id
                    })) as Prisma.ShippingAddressCreateManyInput[]
                });
            })
        );
    }
};
