import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly client?: Redis;
    private readonly keyPrefix: string;
    private isConnected = false;

    constructor(private readonly configService: ConfigService) {
        const url = this.configService.get<string>('redis.url') ?? process.env.REDIS_URL;
        this.keyPrefix = this.configService.get<string>('redis.keyPrefix') ?? 'nest-with-mongodb';

        if (!url) {
            this.logger.warn('Redis URL not provided. Redis features will be disabled.');
            return;
        }

        this.client = new Redis(url, {
            keyPrefix: `${this.keyPrefix}:`,
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            reconnectOnError: () => true
        });

        this.client.on('error', (error) => {
            this.isConnected = false;
            this.logger.error(`Redis Error: ${error.message}`);
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.log('Redis connected');
        });

        this.client.on('close', () => {
            this.isConnected = false;
            this.logger.warn('Redis connection closed');
        });
    }

    async onModuleInit() {
        if (!this.client) {
            return;
        }

        try {
            await this.client.connect();
        } catch (error) {
            this.logger.error('Failed to connect to Redis during startup. Continuing without Redis.');
        }
    }

    async onModuleDestroy() {
        if (!this.client) {
            return;
        }

        try {
            await this.client.quit();
        } catch {
            // Ignore quit errors during shutdown
        }
    }

    get isEnabled() {
        return Boolean(this.client) && this.isConnected;
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled || !this.client) {
            return null;
        }

        const value = await this.client.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    async mget<T>(keys: string[]): Promise<Array<T | null>> {
        if (!this.isEnabled || !this.client || !keys.length) {
            return keys.map(() => null);
        }

        const values = await this.client.mget(keys);
        return values.map((value) => (value ? (JSON.parse(value) as T) : null));
    }

    async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        if (!this.isEnabled || !this.client) {
            return;
        }

        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }

    async del(...keys: string[]): Promise<void> {
        if (!this.isEnabled || !this.client || !keys.length) {
            return;
        }

        await this.client.del(...keys);
    }

    async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
        if (!this.isEnabled || !this.client) {
            return true;
        }

        const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async releaseLock(key: string): Promise<void> {
        if (!this.isEnabled || !this.client) {
            return;
        }

        await this.client.del(key);
    }
}
