import { Logger } from '@nestjs/common';

const getEnv = (key: string, missingVars: string[]): string => {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') {
        missingVars.push(key);
        return '';
    }
    return value;
};
export default () => {
    const logger = new Logger('EnvironmentConfig');
    const missingVars: string[] = [];
    const config = {
        port: parseInt(getEnv('PORT', missingVars), 10),
        bcryptSalt: getEnv('BCRYPT_SALT', missingVars),
        incomingRequestsLogging: getEnv('INCOMING_REQUESTS_LOGGING', missingVars),
        mongodb: {
            uri: getEnv('MONGODB_URL', missingVars),
            dbName: getEnv('MONGODB_DB_NAME', missingVars)
        },
        redis: {
            url: getEnv('REDIS_URL', missingVars),
            keyPrefix: getEnv('REDIS_KEY_PREFIX', missingVars),
            defaultTtlSeconds: parseInt(getEnv('REDIS_DEFAULT_TTL', missingVars), 10),
            localTtlSeconds: parseInt(getEnv('REDIS_LOCAL_TTL', missingVars), 10),
            snapshotTtlSeconds: parseInt(getEnv('REDIS_SNAPSHOT_TTL', missingVars), 10),
            itemTtlSeconds: parseInt(getEnv('REDIS_ITEM_TTL', missingVars), 10),
            pageTtlSeconds: parseInt(getEnv('REDIS_PAGE_TTL', missingVars), 10)
        },
        i18n: {
            defaultLanguage: getEnv('DEFAULT_LANGUAGE', missingVars),
            supportedLanguages: getEnv('SUPPORTED_LANGUAGES', missingVars).split(',').map((language) => language.trim())
        },
        jwt: {
            validity: getEnv('JWT_VALIDITY', missingVars),
            secret: getEnv('JWT_SECRET', missingVars),
            algorithm: getEnv('JWT_ALGORITHM', missingVars)
        }
    };

    if (missingVars.length > 0) {
        logger.error(`Critical Error: Missing required environment variables: ${missingVars.join(', ')}`);
        logger.error('Please resolve these missing variables in your .env file. The system will halt until resolved.');
        process.exit(1);
    }

    return config;
};

