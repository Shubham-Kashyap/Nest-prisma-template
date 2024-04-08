import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Injectable()
export class ProductService {
    constructor(private prismaService: PrismaService) {}

    async getProducts(limit: number, offset: number, filterOptions: ProductFilter) {
        const { category, priceRange, rating } = filterOptions;
        const baseQuery = {
            where: {
                isDeleted: false,
                ...(category && { category: { name: { contains: category } } }),
                price: {
                    ...(priceRange.min && { gte: priceRange.min }),
                    ...(priceRange.min && { gte: priceRange.min })
                },
                ...(rating && { reviews: { some: { rating: { gte: rating } } } })
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                highlights: {
                    select: {
                        title: true,
                        description: true
                    }
                },
                specifications: {
                    select: {
                        title: true,
                        description: true
                    }
                },
                images: true,
                reviews: {
                    select: {
                        rating: true,
                        comment: true,
                        userId: true,
                        productId: true
                    }
                }
            }
        };
        return {
            data: await this.prismaService.product.findMany({
                ...baseQuery,
                ...(!isNaN(limit) &&
                    !isNaN(offset) && {
                        take: limit,
                        skip: offset
                    })
            }),
            count: (await this.prismaService.product.findMany(baseQuery)).length
        };
    }

    async getProductsCount() {
        return this.prismaService.product.count();
    }

    async deleteProduct(productId: string) {
        return await this.prismaService.product.update({
            where: {
                id: productId
            },
            data: {
                isDeleted: true
            }
        });
    }

    async updateProduct(productId: string, data) {
        return await this.prismaService.product.update({
            where: {
                id: productId
            },
            data: {
                ...data
            }
        });
    }

    async getProductDetails(productId: string) {
        return await this.prismaService.product.findFirst({
            where: {
                id: productId
            },
            include: {
                images: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                reviews: {
                    select: {
                        rating: true,
                        comment: true,
                        userId: true,
                        productId: true
                    }
                },
                highlights: {
                    select: {
                        title: true,
                        description: true
                    }
                },
                specifications: {
                    select: {
                        title: true,
                        description: true
                    }
                }
            }
        });
    }
}
