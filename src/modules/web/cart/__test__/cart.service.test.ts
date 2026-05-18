import { Test, TestingModule } from '@nestjs/testing';
import CartService from '../cart.service';
import { PrismaService } from '@services/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CartService', () => {
    let service: CartService;
    let prisma: PrismaService;

    const mockPrismaService = {
        cart: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<CartService>(CartService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkCartItem', () => {
        it('should call prisma.cart.findFirst with correct params', async () => {
            const params = { cartId: '1', productId: 'p1', userId: 'u1' };
            await service.checkCartItem(params);
            expect(prisma.cart.findFirst).toHaveBeenCalledWith({
                where: { id: '1', productId: 'p1', userId: 'u1' }
            });
        });
    });

    describe('addToCart', () => {
        it('should create a cart item if it does not exist', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);
            await service.addToCart('u1', 'p1', 2);
            expect(prisma.cart.create).toHaveBeenCalledWith({
                data: { userId: 'u1', productId: 'p1', quantity: 2 }
            });
        });

        it('should throw BadRequestException if item already exists', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
            await expect(service.addToCart('u1', 'p1', 2)).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeFromCart', () => {
        it('should delete a cart item if it exists', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue({ id: 'c1' });
            await service.removeFromCart('c1');
            expect(prisma.cart.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
        });

        it('should throw BadRequestException if item does not exist', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);
            await expect(service.removeFromCart('c1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateCartItems', () => {
        it('should update quantity if item exists', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue({ id: 'c1' });
            await service.updateCartItems('c1', 5);
            expect(prisma.cart.update).toHaveBeenCalledWith({
                where: { id: 'c1' },
                data: { quantity: 5 }
            });
        });

        it('should throw BadRequestException if item does not exist', async () => {
            (prisma.cart.findFirst as jest.Mock).mockResolvedValue(null);
            await expect(service.updateCartItems('c1', 5)).rejects.toThrow(BadRequestException);
        });
    });

    describe('clearCart', () => {
        it('should delete all cart items for a user', async () => {
            await service.clearCart('u1');
            expect(prisma.cart.deleteMany).toHaveBeenCalledWith({
                where: { userId: 'u1' }
            });
        });
    });
});
