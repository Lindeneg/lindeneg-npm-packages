import { EmptyObj } from "../shared";

export type CacheConfig<T extends EmptyObj> = {
  trim: number;
  ttl: number;
  initial: Partial<T>;
};

export type CacheEntry<T> = {
  expires: number;
  value: T;
};

export type CacheData<T extends EmptyObj> = Partial<{
  [K in keyof T]: CacheEntry<T[K]>;
}>;

export function getTime() {
  return new Date().getTime() / 1000;
}

export default class Cache<T extends EmptyObj> {
  private interval: NodeJS.Timer;
  private config: CacheConfig<T>;
  private data: CacheData<T>;
  private listeners: Partial<{ [K in keyof Cache<T>]: Cache<T>[K] }>;

  constructor(config?: Partial<CacheConfig<T>>) {
    this.config = {
      trim: config?.trim || 600,
      ttl: config?.ttl || 3600,
      initial: config?.initial || {},
    };
    this.listeners = {};
    this.data = this.handleInitialData(this.config.initial);

    this.interval = setInterval(this.trim, this.config.trim * 1000);
  }

  public keys = () => {
    const keys: Array<keyof T> = [];
    this.each((key) => {
      if (this.has(key)) {
        keys.push(key);
      }
    });
    return keys;
  };

  public size = () => {
    return this.keys().length;
  };

  public has = (key: keyof T) => {
    return typeof this.data[key] !== "undefined";
  };

  public get = <K extends keyof T>(key: K): CacheEntry<T[K]> | null => {
    return this.data[key] || null;
  };

  public value = <K extends keyof T>(key: K): T[K] | null => {
    const entry = this.data[key];
    return entry ? entry.value : null;
  };

  public set = <K extends keyof T>(key: K, value: T[K]) => {
    this.listeners.set && this.listeners.set(key, value);
    this.data[key] = this.createEntry(value);
  };

  public remove = (key: keyof T) => {
    this.listeners.remove && this.listeners.remove(key);
    delete this.data[key];
  };

  public clear = () => {
    this.listeners.clear && this.listeners.clear();
    this.each((key) => {
      if (this.has(key)) {
        this.remove(key);
      }
    });
  };

  public destruct = () => {
    this.listeners.destruct && this.listeners.destruct();
    this.clear();
    clearInterval(this.interval);
  };

  // TODO allow to listen for trim event
  public on = <K extends "set" | "remove" | "clear" | "destruct">(
    event: K,
    callback: Cache<T>[K]
  ): void => {
    this.listeners[event] = callback;
  };

  private handleInitialData(obj?: Partial<T>): CacheData<T> {
    if (obj) {
      return Object.keys(obj).reduce(
        (a, b) => ({ ...a, [b]: this.createEntry(obj[b]) }),
        {}
      );
    }
    return {};
  }

  private each = (cb: (key: keyof T) => void) => {
    for (const key in this.data) {
      cb(key);
    }
  };

  private trim = () => {
    const now = getTime();
    this.each((key) => {
      const entry = this.data[key];
      if (entry && entry.expires < now) {
        this.remove(key);
      }
    });
  };

  private createEntry = <T>(value: T): CacheEntry<T> => {
    return {
      value,
      expires: getTime() + this.config.ttl,
    };
  };
}
