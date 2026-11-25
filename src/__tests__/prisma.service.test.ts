import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

describe('PrismaService', () => {
    let prismaService: PrismaService;
    let logSpy: ReturnType<typeof jest.spyOn>;
    let errorSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
        prismaService = new PrismaService();
        logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
        errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log success when database connects on module init', async () => {
        const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValueOnce(undefined);

        await prismaService.onModuleInit();

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith('Database connected successfully');
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should log error and rethrow when database connection fails on module init', async () => {
        const dbError = new Error('Connection refused');
        jest.spyOn(prismaService, '$connect').mockRejectedValueOnce(dbError);

        await expect(prismaService.onModuleInit()).rejects.toThrow('Connection refused');

        expect(errorSpy).toHaveBeenCalledWith(
            'Failed to connect to database during startup: Connection refused',
            dbError.stack
        );
        expect(logSpy).not.toHaveBeenCalled();
    });

    it('should log when database disconnects on module destroy', async () => {
        const disconnectSpy = jest.spyOn(prismaService, '$disconnect').mockResolvedValueOnce(undefined);

        await prismaService.onModuleDestroy();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith('Database disconnected');
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should log error if database disconnect fails on module destroy', async () => {
        const disconnectError = new Error('Disconnect failed');
        jest.spyOn(prismaService, '$disconnect').mockRejectedValueOnce(disconnectError);

        await expect(prismaService.onModuleDestroy()).resolves.toBeUndefined();

        expect(errorSpy).toHaveBeenCalledWith(
            'Failed to disconnect from database: Disconnect failed',
            disconnectError.stack
        );
    });
});
