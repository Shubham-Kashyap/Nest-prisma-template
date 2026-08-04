import { Logger } from '@nestjs/common';
import envConfig from '../dot-env';

describe('Environment Config', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        originalEnv = { ...process.env };
        process.env = {
            PORT: '3000',
            BCRYPT_SALT: '10',
            INCOMING_REQUESTS_LOGGING: '1',
            MONGODB_URL: 'mongodb://localhost:27017',
            MONGODB_DB_NAME: 'test_db',
            REDIS_URL: 'redis://localhost:6379',
            REDIS_KEY_PREFIX: 'test_prefix',
            REDIS_DEFAULT_TTL: '120',
            REDIS_LOCAL_TTL: '15',
            REDIS_SNAPSHOT_TTL: '180',
            REDIS_ITEM_TTL: '600',
            REDIS_PAGE_TTL: '90',
            DEFAULT_LANGUAGE: 'en',
            SUPPORTED_LANGUAGES: 'en, hi',
            JWT_VALIDITY: '60m',
            JWT_SECRET: 'secret',
            JWT_ALGORITHM: 'HS256'
        };
        
        exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
            throw new Error(`process.exit called with ${code}`);
        });
        
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should return configuration when all environment variables are present', () => {
        const config = envConfig();
        expect(config.port).toBe(3000);
        expect(config.mongodb.dbName).toBe('test_db');
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it('should call process.exit when a required environment variable is missing', () => {
        delete process.env.MONGODB_URL;
        
        expect(() => {
            envConfig();
        }).toThrow('process.exit called with 1');
        
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});
