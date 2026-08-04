import { PrismaClient, Role } from '@prisma/client';
import { userData } from './userData';

const prisma = new PrismaClient();

export default async () => {
    for (const user of userData) {
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true }
        });

        if (existingUser) {
            continue;
        }

        const { shippingAddress, role, ...data } = user;

        await prisma.user.create({
            data: {
                ...data,
                role: role === 'admin' ? Role.admin : Role.user,
                shippingAddress: {
                    create: shippingAddress.map((address) => ({
                        ...address
                    }))
                }
            }
        });
    }
};
