import { PrismaClient } from '@prisma/client';

import categorySeeder from './seeder/category/category.seeder';
import productsSeeder from './seeder/products/products.seeder';
import userSeeder from './seeder/user/user.seeder';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import reviewSeeder from './seeder/reviews/review.seeder';

const prisma = new PrismaClient();

export const seed = async () => {
    try {
        await categorySeeder();
        await userSeeder();
        await productsSeeder();
        // await reviewSeeder(); /** Commented on purpose s */
        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Error occurred during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
};

// Call the seed function
seed()
    .then(() => {
        console.log('Database seeding process finished.');
    })
    .catch((error) => {
        console.error('Seeding process failed:', error);
    });
