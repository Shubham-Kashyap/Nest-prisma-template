import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service';

interface MemoryEntry<T> {
    value: T;
    expiresAt: number;
}

interface CacheSetOptions {
    ttlSeconds?: number;
    localTtlSeconds?: number;
}

interface CacheWrapOptions extends CacheSetOptions {
    lockTtlSeconds?: number;
}

@Injectable()
export class HybridCacheService {
    private readonly localCache = new Map<string, MemoryEntry<unknown>>();
    private readonly defaultTtlSeconds: number;
    private readonly defaultLocalTtlSeconds: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService
    ) {
        this.defaultTtlSeconds = this.configService.get<number>('redis.defaultTtlSeconds') ?? 120;
        this.defaultLocalTtlSeconds = this.configService.get<number>('redis.localTtlSeconds') ?? 15;
    }

    async get<T>(key: string): Promise<T | null> {
        const localValue = this.getLocal<T>(key);
        if (localValue !== null) {
            return localValue;
        }

        const redisValue = await this.redisService.get<T>(key);
        if (redisValue !== null) {
            this.setLocal(key, redisValue, this.defaultLocalTtlSeconds);
        }

        return redisValue;
    }

    async mget<T>(keys: string[]): Promise<Array<T | null>> {
        const results: Array<T | null> = [];
        const missingKeys: string[] = [];
        const missingIndexes: number[] = [];

        keys.forEach((key, index) => {
            const localValue = this.getLocal<T>(key);

            if (localValue !== null) {
                results[index] = localValue;
                return;
            }

            missingKeys.push(key);
            missingIndexes.push(index);
            results[index] = null;
        });

        if (!missingKeys.length) {
            return results;
        }

        const redisValues = await this.redisService.mget<T>(missingKeys);
        redisValues.forEach((value, index) => {
            if (value !== null) {
                this.setLocal(missingKeys[index], value, this.defaultLocalTtlSeconds);
            }

            results[missingIndexes[index]] = value;
        });

        return results;
    }

    async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<T> {
        const ttlSeconds = options.ttlSeconds ?? this.defaultTtlSeconds;
        const localTtlSeconds = options.localTtlSeconds ?? Math.min(ttlSeconds, this.defaultLocalTtlSeconds);

        this.setLocal(key, value, localTtlSeconds);
        await this.redisService.set(key, value, ttlSeconds);
        return value;
    }

    async del(...keys: string[]): Promise<void> {
        keys.forEach((key) => {
            this.localCache.delete(key);
        });

        await this.redisService.del(...keys);
    }

    async wrap<T>(key: string, factory: () => Promise<T>, options: CacheWrapOptions = {}): Promise<T> {
        const cachedValue = await this.get<T>(key);
        if (cachedValue !== null) {
            return cachedValue;
        }

        const lockKey = `lock:${key}`;
        const lockAcquired = await this.redisService.acquireLock(lockKey, options.lockTtlSeconds ?? 10);

        if (!lockAcquired) {
            // Lock is held by another process, wait and retry
            for (let attempt = 0; attempt < 10; attempt += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                const retriedValue = await this.get<T>(key);
                if (retriedValue !== null) {
                    return retriedValue;
                }
            }
            // If we still don't have it, we might want to log a warning or proceed with caution.
            // For now, we'll proceed to call the factory to ensure the request doesn't fail,
            // but we'll try to acquire the lock again just in case it was released.
            const secondLockAttempt = await this.redisService.acquireLock(lockKey, options.lockTtlSeconds ?? 10);
            if (!secondLockAttempt) {
                return factory(); // Fallback to factory without caching if lock still held
            }
        }

        try {
            // Double-check after acquiring lock
            const doubleCheckedValue = await this.get<T>(key);
            if (doubleCheckedValue !== null) {
                return doubleCheckedValue;
            }

            const freshValue = await factory();
            await this.set(key, freshValue, options);
            return freshValue;
        } finally {
            await this.redisService.releaseLock(lockKey);
        }
    }

    private getLocal<T>(key: string): T | null {
        const entry = this.localCache.get(key) as MemoryEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        if (Date.now() >= entry.expiresAt) {
            this.localCache.delete(key);
            return null;
        }

        return entry.value;
    }

    private setLocal<T>(key: string, value: T, ttlSeconds: number): void {
        this.localCache.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }
}
