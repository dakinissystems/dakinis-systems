/**
 * Unified cache abstraction — Redis adapter with in-memory fallback + tag invalidation.
 */

export class CacheService {
  /**
   * @param {{
   *   get?: (key: string) => Promise<string | null>,
   *   set?: (key: string, value: string, ttlSec: number) => Promise<void>,
   *   del?: (keys: string[]) => Promise<void>,
   *   sAdd?: (tagKey: string, members: string[]) => Promise<void>,
   *   sMembers?: (tagKey: string) => Promise<string[]>,
   *   maxMemoryKeys?: number,
   * }} [adapter]
   */
  constructor(adapter = {}) {
    this.getFn = adapter.get;
    this.setFn = adapter.set;
    this.delFn = adapter.del;
    this.sAddFn = adapter.sAdd;
    this.sMembersFn = adapter.sMembers;
    this.maxMemoryKeys = adapter.maxMemoryKeys ?? 500;
    /** @type {Map<string, { value: string; expiresAt: number; tags: string[] }>} */
    this.memory = new Map();
    /** @type {Map<string, Set<string>>} */
    this.tagIndex = new Map();
  }

  /** @param {string} tag */
  tagKey(tag) {
    return `cache:tag:${tag}`;
  }

  /**
   * @param {string} key
   */
  async get(key) {
    if (this.getFn) {
      try {
        const hit = await this.getFn(key);
        if (hit != null) return hit;
      } catch {
        /* memory fallback */
      }
    }
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * @param {string} key
   * @param {string} value
   * @param {number} ttlSec
   * @param {{ tags?: string[] }} [options]
   */
  async set(key, value, ttlSec, options = {}) {
    if (this.setFn) {
      try {
        await this.setFn(key, value, ttlSec);
      } catch {
        /* memory fallback */
      }
    }
    const tags = options.tags || [];
    if (this.sAddFn && tags.length) {
      try {
        for (const tag of tags) {
          await this.sAddFn(this.tagKey(tag), [key]);
        }
      } catch {
        /* ignore redis tag errors */
      }
    }
    if (this.memory.size >= this.maxMemoryKeys) {
      const first = this.memory.keys().next().value;
      if (first) this.memory.delete(first);
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000, tags });
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
      this.tagIndex.get(tag).add(key);
    }
  }

  /**
   * @param {string[]} keys
   */
  async del(keys) {
    if (this.delFn) {
      try {
        await this.delFn(keys);
      } catch {
        /* ignore */
      }
    }
    for (const key of keys) this.memory.delete(key);
  }

  /**
   * @param {string} tag
   */
  async invalidateTag(tag) {
    const keys = new Set(this.tagIndex.get(tag) || []);
    if (this.sMembersFn) {
      try {
        const remote = await this.sMembersFn(this.tagKey(tag));
        for (const k of remote || []) keys.add(k);
      } catch {
        /* ignore */
      }
    }
    if (keys.size) await this.del([...keys]);
    this.tagIndex.delete(tag);
    if (this.delFn) {
      try {
        await this.delFn([this.tagKey(tag)]);
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * @param {string[]} tags
   */
  async invalidateTags(tags) {
    for (const tag of tags) await this.invalidateTag(tag);
  }

  /**
   * @param {string} key
   * @param {number} ttlSec
   * @param {() => Promise<T>} loader
   * @param {{ tags?: string[] }} [options]
   * @template T
   */
  async memo(key, ttlSec, loader, options = {}) {
    const hit = await this.get(key);
    if (hit) {
      try {
        return { data: JSON.parse(hit), cached: true };
      } catch {
        await this.del([key]);
      }
    }
    const data = await loader();
    await this.set(key, JSON.stringify(data), ttlSec, options);
    return { data, cached: false };
  }
}
