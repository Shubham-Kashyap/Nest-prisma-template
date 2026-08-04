import { Test, TestingModule } from '@nestjs/testing';
import AuthService from '../auth.service';
import { PrismaService } from '@services/prisma.service';
import {
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    BadRequestException
} from '@nestjs/common';
import { Role } from '@prisma/client';

jest.mock('@utilities/hash', () => ({
    comparePasswords: jest.fn(),
    encryptPassword: jest.fn().mockReturnValue('encrypted_password')
}));

import { comparePasswords } from '@utilities/hash';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('verifyUserCredentials', () => {
        it('should return user details if credentials are valid', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashed_password',
                isEmailVerified: true,
                role: Role.user
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (comparePasswords as jest.Mock).mockReturnValue(true);

            const result = await service.verifyUserCredentials('test@example.com', 'password');
            expect(result).toEqual({
                id: '1',
                isEmailVerified: true,
                role: Role.user
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.verifyUserCredentials('none@example.com', 'pwd')).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if email not verified', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ isEmailVerified: false });
            await expect(service.verifyUserCredentials('test@example.com', 'pwd')).rejects.toThrow(ForbiddenException);
        });

        it('should throw InternalServerErrorException if user has no password', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ isEmailVerified: true, password: null });
            await expect(service.verifyUserCredentials('test@example.com', 'pwd')).rejects.toThrow(
                InternalServerErrorException
            );
        });

        it('should throw ForbiddenException if passwords do not match', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ isEmailVerified: true, password: 'hash' });
            (comparePasswords as jest.Mock).mockReturnValue(false);
            await expect(service.verifyUserCredentials('test@example.com', 'wrong')).rejects.toThrow(
                ForbiddenException
            );
        });
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', email: 'new@example.com' });

            const result = await service.createUser({
                firstName: 'John',
                lastName: 'Doe',
                email: 'new@example.com',
                password: 'password123'
            });

            expect(result).toEqual({ id: '1', email: 'new@example.com' });
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
            await expect(service.createUser({ email: 'exists@example.com' } as any)).rejects.toThrow(
                ForbiddenException
            );
        });

        it('should throw BadRequestException if password is missing', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.createUser({ email: 'new@example.com' } as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('forgotPassword', () => {
        it('should generate a reset token and return email', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
            (prisma.user.update as jest.Mock).mockResolvedValue({});

            const result = await service.forgotPassword({ email: 'test@example.com' });
            expect(result).toEqual({ email: 'test@example.com' });
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ userToken: expect.any(String) })
                })
            );
        });

        it('should throw NotFoundException if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.forgotPassword({ email: 'none@example.com' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('resetPassword', () => {
        it('should update password and clear token', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1', userToken: 'token123' });
            (prisma.user.update as jest.Mock).mockResolvedValue({});

            const result = await service.resetPassword({ email: 'test@example.com', password: 'new_password' });
            expect(result).toEqual({ message: 'Password reset successful' });
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ userToken: null })
                })
            );
        });

        it('should throw NotFoundException if user not found', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            await expect(service.resetPassword({ email: 'none@example.com', password: 'pwd' })).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw BadRequestException if password is missing', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
            await expect(service.resetPassword({ email: 'test@example.com' } as any)).rejects.toThrow(
                BadRequestException
            );
        });
    });
});
