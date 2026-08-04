import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class CacheKeyService {
    buildNamespacedKey(prefix: string, ...parts: Array<string | number>): string {
        return [prefix, ...parts].join(':');
    }

    buildQueryKey(namespace: string, query: Record<string, unknown>): string {
        return this.buildNamespacedKey(namespace, 'q', this.hash(this.normalize(query)));
    }

    buildPageKey(baseKey: string, page: number, limit: number): string {
        return this.buildNamespacedKey(baseKey, 'p', page, 'l', limit);
    }

    buildItemKey(namespace: string, itemId: string): string {
        return this.buildNamespacedKey(namespace, 'item', itemId);
    }

    normalize(input: unknown): unknown {
        if (Array.isArray(input)) {
            return input.map((value) => this.normalize(value));
        }

        if (input instanceof Date) {
            return input.toISOString();
        }

        if (input && typeof input === 'object') {
            return Object.keys(input as Record<string, unknown>)
                .sort()
                .reduce(
                    (normalized, key) => {
                        const value = (input as Record<string, unknown>)[key];

                        if (value === undefined || Number.isNaN(value)) {
                            return normalized;
                        }

                        normalized[key] = this.normalize(value);
                        return normalized;
                    },
                    {} as Record<string, unknown>
                );
        }

        return input;
    }

    private hash(input: unknown): string {
        return createHash('sha256').update(JSON.stringify(input)).digest('hex');
    }
}
