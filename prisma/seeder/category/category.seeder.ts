import { PrismaClient } from '@prisma/client';
import { categories } from './categoryData';

const prisma = new PrismaClient();

export default async () => {
    const categoryCount = await prisma.category.count();

    if (categoryCount === 0) {
        const categoryCreationPromises = categories.map((category) => {
            return prisma.category.create({ data: category });
        });

        await Promise.all(categoryCreationPromises);
    }
};
