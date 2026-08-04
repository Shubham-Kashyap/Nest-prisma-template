import { Logger } from '@nestjs/common';

export interface RedisConfiguration {
    url?: string;
    keyPrefix: string;
    defaultTtlSeconds: number;
    localTtlSeconds: number;
    snapshotTtlSeconds: number;
    itemTtlSeconds: number;
    pageTtlSeconds: number;
}

export const redisConfiguration = (): RedisConfiguration => {
    const configuration: RedisConfiguration = {
        url: process.env.REDIS_URL,
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'nest-with-mongodb',
        defaultTtlSeconds: parseInt(process.env.REDIS_DEFAULT_TTL || '120', 10),
        localTtlSeconds: parseInt(process.env.REDIS_LOCAL_TTL || '15', 10),
        snapshotTtlSeconds: parseInt(process.env.REDIS_SNAPSHOT_TTL || '180', 10),
        itemTtlSeconds: parseInt(process.env.REDIS_ITEM_TTL || '600', 10),
        pageTtlSeconds: parseInt(process.env.REDIS_PAGE_TTL || '90', 10)
    };

    if (!configuration.url) {
        new Logger('RedisConfig').warn('REDIS_URL is not configured. Redis L2 cache will stay disabled.');
    }

    return configuration;
};
