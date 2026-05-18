import { Test, TestingModule } from '@nestjs/testing';
import OrderService from '../order.service';
import { PrismaService } from '@services/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
    let service: OrderService;
    let prisma: PrismaService;

    const mockPrismaService = {
        cart: {
            findMany: jest.fn(),
            deleteMany: jest.fn()
        },
        order: {
            create: jest.fn(),
            findUnique: jest.fn()
        },
        $transaction: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<OrderService>(OrderService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCartItems', () => {
        it('should call prisma.cart.findMany with correct params', async () => {
            await service.getCartItems('u1');
            expect(prisma.cart.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'u1' }
                })
            );
        });
    });

    describe('createOrder', () => {
        it('should create an order and clear cart if everything is valid', async () => {
            const mockCartItems = [{ productId: 'p1' }, { productId: 'p2' }];
            const mockOrder = { id: 'o1' };

            (prisma.cart.findMany as jest.Mock).mockResolvedValue(mockCartItems);
            (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
                const tx = {
                    order: { create: jest.fn().mockResolvedValue(mockOrder) },
                    cart: { deleteMany: jest.fn().mockResolvedValue({}) }
                };
                return cb(tx);
            });

            jest.spyOn(service, 'userOrdersList').mockResolvedValue(mockOrder as any);

            const result = await service.createOrder('u1', 100, 'addr1');

            expect(result).toEqual(mockOrder);
            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should throw BadRequestException if cart is empty', async () => {
            (prisma.cart.findMany as jest.Mock).mockResolvedValue([]);
            await expect(service.createOrder('u1', 100, 'addr1')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if shippingAddressId is missing', async () => {
            (prisma.cart.findMany as jest.Mock).mockResolvedValue([{ productId: 'p1' }]);
            await expect(service.createOrder('u1', 100)).rejects.toThrow(BadRequestException);
        });
    });

    describe('userOrdersList', () => {
        it('should return order if found', async () => {
            const mockOrder = { id: 'o1' };
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

            const result = await service.userOrdersList('o1');
            expect(result).toEqual(mockOrder);
        });

        it('should throw NotFoundException if order not found', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.userOrdersList('o1')).rejects.toThrow(NotFoundException);
        });
    });
});
