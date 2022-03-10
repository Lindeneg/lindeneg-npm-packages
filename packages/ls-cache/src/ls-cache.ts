import Cache from '@lindeneg/cache';
import type { CacheEntry } from '@lindeneg/cache';
import type { ObjConstraint, EmptyObj } from '@lindeneg/types';
import { DEFAULT_PREFIX } from './constants';
import type { Config, MappedKeys } from './types';

export default class LS<
  T extends ObjConstraint<T> = EmptyObj
> extends Cache<T> {
  private readonly prefix: string;
  private readonly regex: RegExp;

  constructor({ prefix, delayInit, ...config }: Config<T> = {}) {
    super(config);
    this.prefix = (prefix || DEFAULT_PREFIX).replace(/[^a-z0-9_]/gi, '');
    this.regex = new RegExp(`^${this.prefix}(.+)$`);

    if (!delayInit) {
      this._initialize();
    }
  }

  public initialize = async (): Promise<LS<T>> => {
    await this.initializeFromLocalStorageAsync();
    await this.initializeListenersAsync();
    await this.trimAsync();
    return this;
  };

  private _initialize = (): void => {
    this.initializeFromLocalStorage();
    this.initializeListeners();
    this.trim();
  };

  private initializeFromLocalStorage = (): void => {
    this.getLSKeys().forEach(({ lKey, pKey }) => {
      const item = this.item(lKey);
      if (item) {
        this.setEntry(pKey, item);
      }
    });
  };

  private initializeFromLocalStorageAsync = async (): Promise<void> => {
    const keys = await this.getLSKeysAsync();
    for (const { lKey, pKey } of keys) {
      const item = await this.itemAsync(lKey);
      if (item) {
        this.setEntry(pKey, item);
      }
    }
  };

  private initializeListeners = (): void => {
    this.on('set', this.onSetListener);
    this.on('remove', this.onRemoveListener);
    this.on('trim', this.onTrimListener);
    this.on('clear', this.onClearListener);
  };

  private initializeListenersAsync = async (): Promise<void> => {
    return new Promise((resolve) => {
      this.initializeListeners();
      resolve();
    });
  };

  private trimAsync = (): Promise<Array<keyof T>> => {
    return new Promise((resolve) => {
      const removed = this.trim();
      resolve(removed);
    });
  };

  private onSetListener = async <K extends keyof T>(
    key: K,
    value: CacheEntry<T[K]>
  ): Promise<void> => {
    try {
      window.localStorage.setItem(
        `${this.prefix}${String(key)}`,
        JSON.stringify(value)
      );
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  private onRemoveListener = async (key: keyof T): Promise<void> => {
    try {
      window.localStorage.removeItem(`${this.prefix}${String(key)}`);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  private onClearListener = async (): Promise<void> => {
    this.getLSKeysAsync().then((keys) => {
      keys.map(({ lKey }) => {
        this.onRemoveListener(lKey);
      });
    });
  };

  private onTrimListener = async (keys: Array<keyof T>): Promise<void> => {
    keys.map((key) => {
      this.onRemoveListener(key);
    });
  };

  private item = <K extends keyof T>(key: K): CacheEntry<T[K]> | null => {
    try {
      const item = window.localStorage.getItem(String(key));
      if (item) {
        const parsed = JSON.parse(item);
        return parsed;
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
    return null;
  };

  private itemAsync = async <K extends keyof T>(
    key: K
  ): Promise<CacheEntry<T[K]> | null> => {
    return new Promise((resolve) => {
      const item = this.item(key);
      resolve(item);
    });
  };

  private getLSKeys = (): Array<MappedKeys<T>> => {
    const result: Array<MappedKeys<T>> = [];
    try {
      for (const key in window.localStorage) {
        const match = this.regex.exec(key);
        if (match && match.length > 1) {
          result.push({ lKey: <keyof T>key, pKey: <keyof T>match[1] });
        }
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
    return result;
  };

  private getLSKeysAsync = async (): Promise<Array<MappedKeys<T>>> => {
    return new Promise((resolve) => {
      const keys = this.getLSKeys();
      resolve(keys);
    });
  };
}
