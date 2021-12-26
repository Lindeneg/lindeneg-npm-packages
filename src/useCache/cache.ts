import { EmptyObj } from "../shared";

type CacheConfig = {
  trim: number;
  ttl: number;
};

type CacheEntry<T> = {
  expires: number;
  value: T;
};

function getTime() {
  return new Date().getTime() / 1000;
}

export default class Cache<T extends EmptyObj> {
  private interval: NodeJS.Timer;
  private config: CacheConfig;
  private data: Partial<{ [K in keyof T]: CacheEntry<T[K]> }>;

  constructor(config?: CacheConfig) {
    this.config = {
      trim: config?.trim || 600,
      ttl: config?.ttl || 3600,
    };
    this.data = {};

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

  public has = (key: keyof T) => {
    return typeof this.data[key] !== "undefined";
  };

  public get = <K extends keyof T>(key: K): CacheEntry<T[K]> | null => {
    return this.data[key] || null;
  };

  public set = <K extends keyof T>(key: K, value: T[K]) => {
    this.data[key] = this.createEntry(value);
  };

  public clear = () => {
    this.each((key) => {
      if (this.has(key)) {
        this.remove(key);
      }
    });
  };

  public destruct = () => {
    this.clear();
    clearInterval(this.interval);
  };

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

  private remove = (key: keyof T) => {
    delete this.data[key];
  };

  private createEntry = <T>(value: T): CacheEntry<T> => {
    return {
      value,
      expires: getTime() + this.config.ttl,
    };
  };
}
