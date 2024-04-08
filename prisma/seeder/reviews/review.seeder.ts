/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from '@prisma/client';
import reviews from './reviews';

const prisma = new PrismaClient();

/** TODO :  add 2 to 4 random reviews on 2 to 4 random product by 2 to 4 users */
const shuffledReviews = (): Array<{ rating: number; comment: string }> => {
    const minNumberOfReviews = 0;
    const maxNumberOfReviews = 3;
    const numberOfReviewsToPick =
        Math.floor(Math.random() * (maxNumberOfReviews - minNumberOfReviews + 1)) + minNumberOfReviews;

    // Shuffle the array and pick the first 'numberOfReviewsToPick' elements
    return reviews
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .slice(0, numberOfReviewsToPick);
};
export default async () => {
    const reviewCount = await prisma.review.count();
    const reviews = shuffledReviews();
    if (reviewCount === 0) {
        await prisma.review.createMany({
            data: reviews.map((review) => ({
                ...review,
                productId: 'clr7p5z8g005jllivs44q6156',
                userId: '6dfad48c-10b5-4df3-8128-fb0dc97d5c6a'
            })) as Prisma.ReviewCreateManyInput[]
        });
    }
};
