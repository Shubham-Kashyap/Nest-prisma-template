import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from '@constants/messages';
import { PrismaService } from '@services/prisma.service';
import { CacheKeyService } from '@services/cache/cache-key.service';
import { HybridCacheService } from '@services/cache/hybrid-cache.service';
import { PaginationSnapshotService } from '@services/cache/pagination-snapshot.service';
import { Prisma } from '@prisma/client';

interface PaginationSnapshot {
    ids: string[];
    totalRecords: number;
    sort: string;
    generatedAt: string;
}

@Injectable()
export class ProductService {
    private readonly productItemTtlSeconds: number;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly paginationSnapshotService: PaginationSnapshotService,
        private readonly hybridCacheService: HybridCacheService,
        private readonly cacheKeyService: CacheKeyService,
        private readonly configService: ConfigService
    ) {
        this.productItemTtlSeconds = this.configService.get<number>('redis.itemTtlSeconds') ?? 600;
    }

    async getProducts(
        limit: number,
        offset: number,
        filterOptions: ProductFilter
    ): Promise<{ data: Product[]; count: number }> {
        const where = this.buildProductWhere(filterOptions);
        const safeLimit = Number.isFinite(limit) ? limit : 20;
        const safeOffset = Number.isFinite(offset) ? offset : 0;
        const page = safeLimit ? Math.floor(safeOffset / safeLimit) + 1 : 1;

        const { key, snapshot } = await this.paginationSnapshotService.getOrCreateSnapshot(
            'products:list',
            {
                filterOptions,
                sort: 'createdAt:desc,id:asc'
            },
            async () => this.buildProductSnapshot(where)
        );

        let resolvedSnapshot = snapshot;

        // Recover from stale empty snapshots after seeding or recent writes.
        if (!resolvedSnapshot.totalRecords) {
            const liveCount = await this.prismaService.product.count({ where });

            if (liveCount > 0) {
                resolvedSnapshot = await this.buildProductSnapshot(where);
            }
        }

        const pageIds = this.paginationSnapshotService.slice(resolvedSnapshot, safeOffset, safeLimit);
        await this.paginationSnapshotService.getOrCreatePageIds(key, page, safeLimit, pageIds);

        return {
            data: await this.getProductsByIds(pageIds),
            count: resolvedSnapshot.totalRecords
        };
    }

    async getProductsCount(): Promise<number> {
        return this.prismaService.product.count({ where: { isDeleted: false } });
    }

    async deleteProduct(productId: string): Promise<Product> {
        try {
            const result = await this.prismaService.product.update({
                where: { id: productId },
                data: { isDeleted: true }
            });
            await this.hybridCacheService.del(this.cacheKeyService.buildItemKey('products', productId));
            return result;
        } catch {
            throw new NotFoundException({ message: MESSAGES.deleteProduct.error.notFound });
        }
    }

    async updateProduct(productId: string, data: UpdateProductDto): Promise<Product> {
        try {
            const { price, discountPercentage, stock, category, ...rest } = data;

            // Remove relation fields from the update object to avoid Prisma errors
            const updateData = Object.fromEntries(
                Object.entries(rest).filter(
                    ([key]) => !['images', 'reviews', 'specifications', 'highlights'].includes(key)
                )
            );

            // Note: images, reviews, specifications, highlights are omitted from the main update
            // as they require nested Prisma updates or separate service calls.
            const result = await this.prismaService.product.update({
                where: { id: productId },
                data: {
                    ...updateData,
                    ...(price !== undefined && { price: Number(price) }),
                    ...(discountPercentage !== undefined && { discountPercentage: Number(discountPercentage) }),
                    ...(stock !== undefined && { stock: Number(stock) }),
                    ...(category !== undefined && { categoryId: category })
                }
            });
            await this.hybridCacheService.del(this.cacheKeyService.buildItemKey('products', productId));
            return result;
        } catch {
            throw new NotFoundException({ message: MESSAGES.editProduct.error.notFound });
        }
    }

    async getProductDetails(productId: string): Promise<Product> {
        const cacheKey = this.cacheKeyService.buildItemKey('products', productId);

        return this.hybridCacheService.wrap(
            cacheKey,
            async () => {
                const product = await this.buildProductProjectionById(productId);

                if (!product) {
                    throw new NotFoundException({ message: MESSAGES.getProduct.error.notFound });
                }

                return product;
            },
            { ttlSeconds: this.productItemTtlSeconds }
        );
    }

    private buildProductWhere(filterOptions: ProductFilter): Prisma.ProductWhereInput {
        const { category, priceRange, rating } = filterOptions;

        return {
            isDeleted: false,
            ...(category && { category: { name: { contains: category, mode: 'insensitive' as const } } }),
            ...(priceRange &&
                (Number.isFinite(priceRange.min) || Number.isFinite(priceRange.max)) && {
                    price: {
                        ...(priceRange.min !== undefined && Number.isFinite(priceRange.min) && { gte: priceRange.min }),
                        ...(priceRange.max !== undefined && Number.isFinite(priceRange.max) && { lte: priceRange.max })
                    }
                }),
            ...(rating && { reviews: { some: { rating: { gte: rating } } } })
        };
    }

    private async buildProductSnapshot(where: Prisma.ProductWhereInput): Promise<PaginationSnapshot> {
        const [products, count] = await Promise.all([
            this.prismaService.product.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                select: { id: true }
            }),
            this.prismaService.product.count({ where })
        ]);

        return {
            ids: products.map((product) => product.id),
            totalRecords: count,
            sort: 'createdAt:desc,id:asc',
            generatedAt: new Date().toISOString()
        };
    }

    private async buildProductProjectionById(productId: string): Promise<Product | null> {
        return this.prismaService.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                images: true,
                reviews: true,
                highlights: true,
                specifications: true
            }
        });
    }

    private async getProductsByIds(productIds: string[]): Promise<Product[]> {
        if (!productIds.length) {
            return [];
        }

        const cacheKeys = productIds.map((productId) => this.cacheKeyService.buildItemKey('products', productId));
        const cachedProducts = await this.hybridCacheService.mget<Product>(cacheKeys);
        const missingProductIds = productIds.filter((_productId, index) => !cachedProducts[index]);

        if (missingProductIds.length) {
            const freshProducts = await Promise.all(
                missingProductIds.map((productId) => this.buildProductProjectionById(productId))
            );

            await Promise.all(
                freshProducts.filter(Boolean).map((product: Product) =>
                    this.hybridCacheService.set(this.cacheKeyService.buildItemKey('products', product.id), product, {
                        ttlSeconds: this.productItemTtlSeconds
                    })
                )
            );
        }

        const hydratedProducts = await this.hybridCacheService.mget<Product>(cacheKeys);
        const productMap = new Map<string, Product>(
            hydratedProducts
                .filter((product): product is Product => Boolean(product))
                .map((product) => [product.id, product])
        );

        return productIds
            .map((productId) => productMap.get(productId))
            .filter((product): product is Product => Boolean(product));
    }
}
