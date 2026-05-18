import { Global, Module } from '@nestjs/common';

import { CacheKeyService } from '@services/cache/cache-key.service';
import { HybridCacheService } from '@services/cache/hybrid-cache.service';
import { PaginationSnapshotService } from '@services/cache/pagination-snapshot.service';
import { RedisService } from '@services/cache/redis.service';

@Global()
@Module({
    providers: [RedisService, HybridCacheService, CacheKeyService, PaginationSnapshotService],
    exports: [RedisService, HybridCacheService, CacheKeyService, PaginationSnapshotService]
})
export class ApplicationCacheModule {}
