import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ApplicationDatabaseModule } from '@modules/shared/module/application-database.module';
import HealthModule from '@modules/system/health/health.module';
import { RedisService } from '@services/cache/redis.service';
import { PrismaService } from '@services/prisma.service';

describe('HealthModule PrismaService Singleton', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should instantiate and connect PrismaService only once across ApplicationDatabaseModule and HealthModule', async () => {
        const connectSpy = jest.spyOn(PrismaService.prototype, '$connect').mockResolvedValue(undefined);
        const disconnectSpy = jest.spyOn(PrismaService.prototype, '$disconnect').mockResolvedValue(undefined);
        const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
                ApplicationDatabaseModule,
                HealthModule
            ]
        })
            .overrideProvider(ConfigService)
            .useValue({ get: () => undefined })
            .overrideProvider(RedisService)
            .useValue({ isEnabled: false })
            .compile();

        await moduleRef.init();

        const dbConnectedLogs = logSpy.mock.calls.filter(([message]) => message === 'Database connected successfully');

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(dbConnectedLogs).toHaveLength(1);

        await moduleRef.close();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
});
