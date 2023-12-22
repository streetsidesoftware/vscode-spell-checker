import type { Uri } from 'vscode';

import type { CSpellClient, GetConfigurationForDocumentResult } from './client';

interface CacheItem {
    config: GetConfigurationForDocumentResult | undefined;
    timestamp: number;
    pending: Promise<GetConfigurationForDocumentResult> | undefined;
}

export class DocumentConfigCache {
    private configs = new Map<string, CacheItem>();

    constructor(
        public getConfigurationForDocument: CSpellClient['getConfigurationForDocument'],
        public staleTimeMs = 1000,
        public maxAgeMs = 5000,
    ) {
        this.configs = new Map();
    }

    get(uri: Uri) {
        const item = this.configs.get(uri.toString());
        if (!item || !item.config || this.isTooOld(item)) {
            this.fetch(uri);
            return undefined;
        }
        if (!this.isState(item)) {
            this.fetch(uri);
        }
        return item.config;
    }

    set(uri: Uri, config: GetConfigurationForDocumentResult) {
        const key = uri.toString();
        const item = this.configs.get(key) || { config, timestamp: performance.now(), pending: undefined };
        item.config = config;
        this.configs.set(key, item);
    }

    delete(uri: Uri) {
        const key = uri.toString();
        return this.configs.delete(key);
    }

    clear() {
        this.configs.clear();
    }

    private async fetchAsync(uri: Uri, item: CacheItem): Promise<GetConfigurationForDocumentResult> {
        try {
            const config = await this.getConfigurationForDocument({ uri });
            item.config = config;
            item.timestamp = performance.now();
            item.pending = undefined;
            return config;
        } finally {
            item.pending = undefined;
            this.cleanup();
        }
    }

    private fetch(uri: Uri) {
        const key = uri.toString();
        const item: CacheItem = this.configs.get(key) || { config: undefined, timestamp: performance.now(), pending: undefined };
        if (item.pending) {
            return item.pending;
        }
        this.configs.set(key, item);
        const pending = this.fetchAsync(uri, item);
        item.pending = pending;
        return pending;
    }

    private isState(item: CacheItem) {
        return item.timestamp + this.staleTimeMs > performance.now();
    }

    private isTooOld(item: CacheItem) {
        return item.timestamp + this.maxAgeMs < performance.now();
    }

    private cleanup() {
        for (const [key, item] of this.configs) {
            if (!item.pending && this.isTooOld(item)) {
                this.configs.delete(key);
            }
        }
    }
}
