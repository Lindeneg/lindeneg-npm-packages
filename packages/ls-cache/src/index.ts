import Logger from '@lindeneg/logger';
import Cache from '@lindeneg/cache';
import type { EmptyObj } from '@lindeneg/types';
import type { CacheEntry, CacheConfig } from '@lindeneg/cache';

const { error } = new Logger(
  '@lindeneg/ls-cache',
  /* istanbul ignore next */
  () => process.env.NODE_ENV === 'development'
);

export type Config<T extends EmptyObj> = Partial<
  Omit<CacheConfig<T>, 'data'>
> & {
  prefix?: string;
  delayInit?: boolean;
};

export const DEFAULT_PREFIX = '__cl_ls_cache__';

export type MappedKeys<T extends EmptyObj> = {
  lKey: string;
  pKey: keyof T;
};

export default class LS<T extends EmptyObj> extends Cache<T> {
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
    return this;
  };

  private _initialize = (): void => {
    this.initializeFromLocalStorage();
    this.initializeListeners();
  };

  private initializeFromLocalStorage = (): void => {
    this.getLSKeys()
      .map((key) => {
        return { key, value: this.item(key.lKey) };
      })
      .forEach((items) => {
        if (items.value) {
          this.setEntry(items.key.pKey, items.value);
        }
      });
  };

  private initializeFromLocalStorageAsync = async (): Promise<void> => {
    await this.getLSKeysAsync().then((keys) => {
      Promise.all(
        keys.map(async (key) => {
          return { key, value: await this.itemAsync(key.lKey) };
        })
      ).then((items) => {
        items.forEach((item) => {
          if (item.value) {
            this.setEntry(item.key.pKey, item.value);
          }
        });
      });
    });
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

  private onSetListener = async <K extends keyof T>(
    key: K,
    value: CacheEntry<T[K]>
  ): Promise<void> => {
    try {
      window.localStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(value)
      );
    } catch (err) {
      /* istanbul ignore next */
      error(
        { msg: 'failed to access localStorage', originalErr: err },
        'onSetListener'
      );
    }
  };

  private onRemoveListener = async <T extends EmptyObj>(
    key: keyof T
  ): Promise<void> => {
    try {
      window.localStorage.removeItem(`${this.prefix}${key}`);
    } catch (err) {
      /* istanbul ignore next */
      error(
        { msg: 'failed to access localStorage', originalErr: err },
        'onRemoveListener'
      );
    }
  };

  private onClearListener = async (): Promise<void> => {
    this.getLSKeysAsync().then((keys) => {
      keys.map(({ lKey }) => {
        this.onRemoveListener(lKey);
      });
    });
  };

  /* istanbul ignore next : is tested: ls-cache.test.ts:'can trim items' */
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
    } catch (err) {
      /* istanbul ignore next */
      error(
        { msg: `could not get and parse key '${key}'`, originalErr: err },
        'item'
      );
    }
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
          result.push({ lKey: key, pKey: match[1] });
        }
      }
    } catch (err) {
      /* istanbul ignore next */
      error(
        { msg: 'failed to access localStorage', originalErr: err },
        'getLSKeys'
      );
    }
    return result;
  };

  private getLSKeysAsync = async (): Promise<Array<MappedKeys<T>>> => {
    return new Promise((resolve) => {
      const keys = this.getLSKeys();
      resolve(keys);
    });
  };
}
