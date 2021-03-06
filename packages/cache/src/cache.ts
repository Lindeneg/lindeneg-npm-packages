import { nowInSeconds } from './util';
import { DEFAULT_TRIM, DEFAULT_TTL } from './constants';
import type { EmptyObj, ObjConstraint, SafeOmit } from '@lindeneg/types';
import type {
  ListenerCallback,
  ListenerConstraint,
  Listeners,
  CacheConfig,
  CacheData,
  CacheEntry,
} from './types';

export default class Cache<T extends ObjConstraint<T> = EmptyObj> {
  private interval: NodeJS.Timer;
  private config: SafeOmit<CacheConfig<T>, 'data'>;
  private listeners: Listeners<T>;
  protected data: CacheData<T>;

  constructor(config?: Partial<CacheConfig<T>>) {
    this.config = {
      trim: config?.trim || DEFAULT_TRIM,
      ttl: config?.ttl || DEFAULT_TTL,
    };
    this.data = config?.data || {};
    this.listeners = {};

    this.interval = setInterval(this.trim, this.config.trim * 1000);
  }

  public keys = (): Array<keyof T> => {
    const keys: Array<keyof T> = [];
    this.each((key) => {
      if (this.has(key)) {
        keys.push(key);
      }
    });
    return keys;
  };

  public size = (): number => {
    return this.keys().length;
  };

  public has = (key: keyof T): boolean => {
    return !!this.get(key);
  };

  public get = <K extends keyof T>(key: K): CacheEntry<T[K]> | null => {
    const entry = this.data[key];
    if (entry) {
      if (this.hasExpired(entry)) {
        this.remove(key);
      } else {
        return entry;
      }
    }
    return null;
  };

  public getAsync = <K extends keyof T>(
    key: K
  ): Promise<CacheEntry<T[K]> | null> => {
    return new Promise((resolve) => {
      const item = this.get(key);
      if (item) {
        resolve(item);
      } else {
        resolve(null);
      }
    });
  };

  public value = <K extends keyof T>(key: K): T[K] | null => {
    const entry = this.get(key);
    return entry ? entry.value : null;
  };

  public valueAsync = <K extends keyof T>(key: K): Promise<T[K] | null> => {
    return new Promise((resolve) => {
      const item = this.value(key);
      if (item) {
        resolve(item);
      } else {
        resolve(null);
      }
    });
  };

  public set = <K extends keyof T>(key: K, value: T[K]): CacheEntry<T[K]> => {
    const entry = this.createEntry(value);
    this.runListener('set', key, entry);
    this.data[key] = entry;
    return entry;
  };

  public setAsync = <K extends keyof T>(
    key: K,
    value: T[K]
  ): Promise<CacheEntry<T[K]>> => {
    return new Promise((resolve) => {
      const entry = this.set(key, value);
      resolve(entry);
    });
  };

  public remove = <K extends keyof T>(key: K): CacheEntry<T[K]> | null => {
    this.runListener('remove', key);
    const entry = this.data[key];
    if (entry) {
      delete this.data[key];
      return entry;
    }
    return null;
  };

  public removeAsync = <K extends keyof T>(
    key: K
  ): Promise<CacheEntry<T[K]> | null> => {
    return new Promise((resolve) => {
      const entry = this.get(key);
      if (entry) {
        this.remove(key);
        resolve(entry);
      } else {
        resolve(null);
      }
    });
  };

  public clear = (): void => {
    this.runListener('clear');
    this.each((key) => {
      if (this.has(key)) {
        this.remove(key);
      }
    });
  };

  public clearAsync = (): Promise<void> => {
    return new Promise((resolve) => {
      this.clear();
      resolve();
    });
  };

  public clearTrimListener = (): void => {
    this.runListener('clearTrimListener');
    clearInterval(this.interval);
  };

  public createEntry = <T>(value: T): CacheEntry<T> => {
    return Cache.createEntry(value, this.config.ttl);
  };

  public on = <K extends ListenerConstraint>(
    event: K,
    callback: ListenerCallback<T, K>
  ): void => {
    const cb = <() => void>callback;
    const entry = this.listeners[event];
    if (Array.isArray(entry)) {
      entry.push(cb);
    } else {
      this.listeners[event] = [cb];
    }
  };

  protected setEntry = <K extends keyof T>(key: K, entry: CacheEntry<T[K]>) => {
    this.data[key] = entry;
  };

  protected trim = (): Array<keyof T> => {
    const removed: Array<keyof T> = [];
    this.each((key) => {
      const entry = this.data[key];
      if (this.hasExpired(entry)) {
        this.remove(key);
        removed.push(key);
      }
    });
    this.runListener('trim', removed);
    return removed;
  };

  private runListener = (
    event: ListenerConstraint,
    ...args: unknown[]
  ): void => {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        (<(...args: unknown[]) => void>callback)(...args);
      });
    }
  };

  private each = (cb: (key: keyof T) => void): void => {
    for (const key in this.data) {
      cb(key);
    }
  };

  private hasExpired = (entry?: CacheEntry<unknown>) => {
    return entry && entry.expires < nowInSeconds();
  };

  public static createEntry = <T>(
    value: T,
    ttl = DEFAULT_TTL
  ): CacheEntry<T> => {
    return {
      value,
      expires: nowInSeconds() + ttl,
    };
  };
}
