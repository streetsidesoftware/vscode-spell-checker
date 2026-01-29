import type { Uri } from 'vscode';

interface CacheItem<T> {
    config: T | undefined;
    timestamp: number;
    pending: Promise<T> | undefined;
}

export class DocumentConfigCache<T> {
    private configs: Map<string, CacheItem<T>> = new Map();

    constructor(
        public getConfigurationForDocument: (uri: Uri) => Promise<T>,
        public staleTimeMs = 1000,
        public maxAgeMs = 5000,
    ) {
        this.configs = new Map();
    }

    get(uri: Uri): NonNullable<T> | undefined {
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

    set(uri: Uri, config: T): void {
        const key = uri.toString();
        const item = this.configs.get(key) || { config, timestamp: performance.now(), pending: undefined };
        item.config = config;
        this.configs.set(key, item);
    }

    delete(uri: Uri): boolean {
        const key = uri.toString();
        return this.configs.delete(key);
    }

    clear(): void {
        this.configs.clear();
    }

    private async fetchAsync(uri: Uri, item: CacheItem<T>): Promise<T> {
        try {
            const config = await this.getConfigurationForDocument(uri);
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
        const item: CacheItem<T> = this.configs.get(key) || { config: undefined, timestamp: performance.now(), pending: undefined };
        if (item.pending) {
            return item.pending;
        }
        this.configs.set(key, item);
        const pending = this.fetchAsync(uri, item);
        item.pending = pending;
        return pending;
    }

    private isState(item: CacheItem<T>) {
        return item.timestamp + this.staleTimeMs > performance.now();
    }

    private isTooOld(item: CacheItem<T>) {
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
