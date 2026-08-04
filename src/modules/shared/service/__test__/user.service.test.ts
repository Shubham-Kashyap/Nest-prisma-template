import { Test, TestingModule } from '@nestjs/testing';
import UserService from '../user.service';
import { PrismaService } from '@services/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('userDetails', () => {
        it('should return user details if found', async () => {
            const mockUser = { id: 'u1', email: 'test@example.com' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.userDetails('u1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.userDetails('u1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('blockUser', () => {
        it('should set isEmailVerified to false', async () => {
            const mockUser = { id: 'u1', isEmailVerified: false };
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.blockUser('u1');
            expect(result.isEmailVerified).toBe(false);
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'u1' },
                    data: { isEmailVerified: false }
                })
            );
        });

        it('should throw NotFoundException if update fails', async () => {
            (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Prisma Error'));
            await expect(service.blockUser('u1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('unblockUser', () => {
        it('should set isEmailVerified to true', async () => {
            const mockUser = { id: 'u1', isEmailVerified: true };
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.unblockUser('u1');
            expect(result.isEmailVerified).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'u1' },
                    data: { isEmailVerified: true }
                })
            );
        });

        it('should throw NotFoundException if update fails', async () => {
            (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Prisma Error'));
            await expect(service.unblockUser('u1')).rejects.toThrow(NotFoundException);
        });
    });
});
