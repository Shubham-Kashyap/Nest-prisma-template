import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheKeyService } from './cache-key.service';
import { HybridCacheService } from './hybrid-cache.service';

interface PaginationSnapshot {
    ids: string[];
    totalRecords: number;
    sort: string;
    generatedAt: string;
}

@Injectable()
export class PaginationSnapshotService {
    private readonly snapshotTtlSeconds: number;
    private readonly pageTtlSeconds: number;

    constructor(
        private readonly hybridCacheService: HybridCacheService,
        private readonly cacheKeyService: CacheKeyService,
        private readonly configService: ConfigService
    ) {
        this.snapshotTtlSeconds = this.configService.get<number>('redis.snapshotTtlSeconds') ?? 180;
        this.pageTtlSeconds = this.configService.get<number>('redis.pageTtlSeconds') ?? 90;
    }

    async getOrCreateSnapshot(
        namespace: string,
        query: Record<string, unknown>,
        factory: () => Promise<PaginationSnapshot>
    ): Promise<{ key: string; snapshot: PaginationSnapshot }> {
        const snapshotKey = this.cacheKeyService.buildQueryKey(namespace, query);

        const snapshot = await this.hybridCacheService.wrap<PaginationSnapshot>(snapshotKey, factory, {
            ttlSeconds: this.snapshotTtlSeconds
        });

        return {
            key: snapshotKey,
            snapshot
        };
    }

    async getOrCreatePageIds(
        baseKey: string,
        page: number,
        limit: number,
        ids: string[]
    ): Promise<{ key: string; ids: string[] }> {
        const pageKey = this.cacheKeyService.buildPageKey(baseKey, page, limit);

        const pageIds = await this.hybridCacheService.wrap<string[]>(pageKey, async () => ids, {
            ttlSeconds: this.pageTtlSeconds
        });

        return {
            key: pageKey,
            ids: pageIds
        };
    }

    slice(snapshot: PaginationSnapshot, offset: number, limit: number): string[] {
        return snapshot.ids.slice(offset, offset + limit);
    }
}
