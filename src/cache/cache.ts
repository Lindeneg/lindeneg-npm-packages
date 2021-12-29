import { EmptyObj } from "../shared";

export type CacheConfig<T extends EmptyObj> = {
  trim: number;
  ttl: number;
  data: CacheData<T>;
};

export type CacheEntry<T> = {
  expires: number;
  value: T;
};

export type CacheData<T extends EmptyObj> = Partial<{
  [K in keyof T]: CacheEntry<T[K]>;
}>;

export type _ListenerConstraint = "set" | "remove" | "clear" | "destruct";

export type ListenerConstraint = _ListenerConstraint | "trim";

export type ListenerCallback<
  T extends EmptyObj,
  K extends ListenerConstraint
> = K extends _ListenerConstraint
  ? Cache<T>[K]
  : (removed: Array<keyof T>) => void;

export type Listeners<T extends EmptyObj> = Partial<{
  [K in ListenerConstraint]: Array<ListenerCallback<T, K>>;
}>;

export function getTime() {
  return new Date().getTime() / 1000;
}

export const DEFAULT_TRIM = 600;
export const DEFAULT_TTL = 3600;

export class Cache<T extends EmptyObj> {
  private interval: NodeJS.Timer;
  private config: Omit<CacheConfig<T>, "data">;
  private data: CacheData<T>;
  private listeners: Listeners<T>;

  constructor(config?: Partial<CacheConfig<T>>) {
    this.config = {
      trim: config?.trim || DEFAULT_TRIM,
      ttl: config?.ttl || DEFAULT_TTL,
    };
    this.data = config?.data || {};
    this.listeners = {};

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
    this.runListener("set", key, value);
    this.data[key] = this.createEntry(value);
  };

  public remove = (key: keyof T) => {
    this.runListener("remove", key);
    delete this.data[key];
  };

  public clear = () => {
    this.runListener("clear");
    this.each((key) => {
      if (this.has(key)) {
        this.remove(key);
      }
    });
  };

  public destruct = () => {
    this.runListener("destruct");
    clearInterval(this.interval);
  };

  public createEntry = <T>(value: T): CacheEntry<T> => {
    return Cache.createEntry(value, this.config.ttl);
  };

  public on = <K extends ListenerConstraint>(
    event: K,
    callback: ListenerCallback<T, K>
  ): void => {
    if (Array.isArray(this.listeners[event])) {
      (this.listeners[event] as Array<() => void>).push(callback as () => void);
    } else {
      this.listeners[event] = [callback as () => void];
    }
  };

  private runListener = (event: ListenerConstraint, ...args: unknown[]) => {
    const callbacks = this.listeners[event] as
      | Array<(...args: unknown[]) => void>
      | undefined;
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args);
      });
    }
  };

  private each = (cb: (key: keyof T) => void) => {
    for (const key in this.data) {
      cb(key);
    }
  };

  private trim = () => {
    const now = getTime();
    const removed: Array<keyof T> = [];
    this.each((key) => {
      const entry = this.data[key];
      if (entry && entry.expires < now) {
        this.remove(key);
        removed.push(key);
      }
    });
    this.runListener("trim", removed);
  };

  public static createEntry = <T>(
    value: T,
    ttl = DEFAULT_TTL
  ): CacheEntry<T> => {
    return {
      value,
      expires: getTime() + ttl,
    };
  };
}
