import { PrismaClient } from '@prisma/client';

import { products } from './productsData';

const prisma = new PrismaClient();
const BATCH_SIZE = 10;

const syncSpecifications = async (specifications, productId) => {
    for (const specification of specifications) {
        await prisma.productSpecification.create({
            data: {
                ...specification,
                productId: productId
            }
        });
    }
};

const syncHighlights = async (highlights, productId) => {
    for (const highlight of highlights) {
        await prisma.productHighlight.create({
            data: {
                ...highlight,
                productId: productId
            }
        });
    }
};
const syncImages = async (images, productId) => {
    for (const image of images) {
        await prisma.image.create({
            data: {
                productId: productId,
                url: image
            }
        });
    }
};

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

                    // Fetch category data
                    const categoryData = await prisma.category.findFirst({
                        where: { name: { contains: category } }
                    });

                    // Create product
                    const createdProduct = await prisma.product.create({
                        data: {
                            title,
                            description,
                            price,
                            discountPercentage,
                            stock,
                            brand,
                            thumbnail,
                            categoryId: categoryData.id,
                            isDeleted: false
                        }
                    });

                    // Seed associated images
                    await syncImages(images, createdProduct.id);

                    // Seed associated specifications
                    await syncSpecifications(specifications, createdProduct.id);

                    // Seed associated highlights
                    await syncHighlights(highlights, createdProduct.id);
                    await prisma.review.findMany({});
                })
            );
        }
    }
};
