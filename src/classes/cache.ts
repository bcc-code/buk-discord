import NodeCache from 'node-cache';

class Cache {
    private cache: NodeCache;
    constructor(ttl: number) {
        this.cache = new NodeCache({
            stdTTL: ttl,
            checkperiod: ttl * 0.2,
            useClones: false,
        });
    }
    async get<T>(key: string, storeFunction: () => Promise<T>): Promise<T> {
        const value = this.cache.get(key) as T;
        if (value) {
            return Promise.resolve(value);
        }
        return storeFunction().then((result: T) => {
            this.cache.set(key, result);
            return Promise.resolve(result);
        });
    }
    del(keys: string | number | NodeCache.Key[]): void {
        this.cache.del(keys);
    }
    flush(): void {
        this.cache.flushAll();
    }
}

export default Cache;
