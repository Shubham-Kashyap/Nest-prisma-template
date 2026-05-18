import { PrismaClient } from '@prisma/client';
import { products } from './productsData';

const prisma = new PrismaClient();
const BATCH_SIZE = 10;

export default async () => {
    const productCount = await prisma.product.count();

    if (productCount === 0) {
        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const productBatch = products.slice(i, i + BATCH_SIZE);

            await Promise.all(
                productBatch.map(async (product) => {
                    const {
                        brand,
                        category,
                        description,
                        discountPercentage,
                        highlights,
                        images,
                        price,
                        stock,
                        thumbnail,
                        specifications,
                        title
                    } = product;

                    const categoryData = await prisma.category.findFirst({
                        where: { name: { contains: category } }
                    });

                    if (!categoryData) {
                        throw new Error(`Unable to seed product "${title}" because category "${category}" was not found.`);
                    }

                    await prisma.product.create({
                        data: {
                            title,
                            description,
                            price,
                            discountPercentage,
                            stock,
                            brand,
                            thumbnail,
                            categoryId: categoryData.id,
                            isDeleted: false,
                            images: {
                                create: images.map((url) => ({
                                    url
                                }))
                            },
                            specifications: {
                                create: specifications.map((specification) => ({
                                    ...specification
                                }))
                            },
                            highlights: {
                                create: highlights.map((highlight) => ({
                                    ...highlight
                                }))
                            }
                        }
                    });
                })
            );
        }
    }
};
