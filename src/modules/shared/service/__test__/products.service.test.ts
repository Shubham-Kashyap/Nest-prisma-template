import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../products.service';
import { PrismaService } from '@services/prisma.service';
import { PaginationSnapshotService } from '@services/cache/pagination-snapshot.service';
import { HybridCacheService } from '@services/cache/hybrid-cache.service';
import { CacheKeyService } from '@services/cache/cache-key.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
    let service: ProductService;
    let prisma: PrismaService;

    const mockPrismaService = {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            update: jest.fn()
        }
    };

    const mockPaginationSnapshotService = {
        getOrCreateSnapshot: jest.fn(),
        slice: jest.fn(),
        getOrCreatePageIds: jest.fn()
    };

    const mockHybridCacheService = {
        del: jest.fn(),
        wrap: jest.fn(),
        mget: jest.fn(),
        set: jest.fn()
    };

    const mockCacheKeyService = {
        buildItemKey: jest.fn().mockReturnValue('mock-key')
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue(600)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: PaginationSnapshotService, useValue: mockPaginationSnapshotService },
                { provide: HybridCacheService, useValue: mockHybridCacheService },
                { provide: CacheKeyService, useValue: mockCacheKeyService },
                { provide: ConfigService, useValue: mockConfigService }
            ]
        }).compile();

        service = module.get<ProductService>(ProductService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getProductDetails', () => {
        it('should return product details from cache or db', async () => {
            const mockProduct = { id: '1', title: 'Test Product' };
            (mockHybridCacheService.wrap as jest.Mock).mockImplementation((_key, cb) => cb());
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

            const result = await service.getProductDetails('1');
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException if product not found', async () => {
            (mockHybridCacheService.wrap as jest.Mock).mockImplementation((_key, cb) => cb());
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.getProductDetails('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteProduct', () => {
        it('should mark product as deleted and clear cache', async () => {
            (prisma.product.update as jest.Mock).mockResolvedValue({ id: '1', isDeleted: true });

            const result = await service.deleteProduct('1');
            expect(result.isDeleted).toBe(true);
            expect(mockHybridCacheService.del).toHaveBeenCalled();
        });

        it('should throw NotFoundException if update fails', async () => {
            (prisma.product.update as jest.Mock).mockRejectedValue(new Error('Prisma Error'));
            await expect(service.deleteProduct('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getProductsCount', () => {
        it('should return count of non-deleted products', async () => {
            (prisma.product.count as jest.Mock).mockResolvedValue(10);
            const result = await service.getProductsCount();
            expect(result).toBe(10);
            expect(prisma.product.count).toHaveBeenCalledWith({ where: { isDeleted: false } });
        });
    });

    describe('updateProduct', () => {
        it('should update product and clear cache', async () => {
            const mockUpdateDto = { title: 'New Title', price: 100 };
            (prisma.product.update as jest.Mock).mockResolvedValue({ id: '1', ...mockUpdateDto });

            const result = await service.updateProduct('1', mockUpdateDto as any);
            expect(result.title).toBe('New Title');
            expect(mockHybridCacheService.del).toHaveBeenCalled();
        });

        it('should throw NotFoundException if product not found on update', async () => {
            (prisma.product.update as jest.Mock).mockRejectedValue(new Error('NotFound'));
            await expect(service.updateProduct('999', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('getProducts', () => {
        it('should return paginated products', async () => {
            const mockSnapshot = { totalRecords: 2, ids: ['1', '2'] };
            mockPaginationSnapshotService.getOrCreateSnapshot.mockResolvedValue({ key: 'key', snapshot: mockSnapshot });
            mockPaginationSnapshotService.slice.mockReturnValue(['1', '2']);

            const mockProducts = [{ id: '1' }, { id: '2' }];
            mockHybridCacheService.mget.mockResolvedValue(mockProducts);

            const result = await service.getProducts(10, 0, {});
            expect(result.data).toHaveLength(2);
            expect(result.count).toBe(2);
        });
    });
});
