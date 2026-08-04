import { PrismaClient } from '@prisma/client';
import { categories } from './categoryData';

const prisma = new PrismaClient();

export default async () => {
    const categoryCount = await prisma.category.count();

    if (categoryCount === 0) {
        await Promise.all(categories.map((category) => prisma.category.create({ data: category })));
    }
};
