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
  delayInitialize?: boolean;
};

export const DEFAULT_PREFIX = '__cl_ls_cache__';

export type MappedKeys<T extends EmptyObj> = {
  lKey: string;
  pKey: keyof T;
};

export default class LS<T extends EmptyObj> extends Cache<T> {
  private readonly prefix: string;
  private readonly regex: RegExp;

  constructor({ prefix, delayInitialize, ...config }: Config<T> = {}) {
    super(config);
    this.prefix = (prefix || DEFAULT_PREFIX).replace(/[^a-z0-9_]/gi, '');
    this.regex = new RegExp(`^${this.prefix}(.+)$`);
    this.initializeListeners();

    if (!delayInitialize) {
      this.initialize();
    }
  }

  public initialize = async (): Promise<void> => {
    await this.initializeFromLocalStorage();
  };

  private initializeFromLocalStorage = async (): Promise<void> => {
    const keys = await this.getLSKeys();
    const items = await Promise.all(
      keys.map(async (key) => {
        return { key, value: await this.item(key.lKey) };
      })
    );
    items.forEach((e) => {
      if (e.value) {
        this.setEntry(e.key.pKey, e.value);
      }
    });
  };

  private initializeListeners = async (): Promise<void> => {
    this.on('set', this.onSetListener);
    this.on('remove', this.onRemoveListener);
    this.on('trim', this.onTrimListener);
    this.on('clear', this.onClearListener);
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
        'LS.maybe'
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
        'LS.maybe'
      );
    }
  };

  private onClearListener = async (): Promise<void> => {
    this.getLSKeys().then((keys) => {
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

  private item = async <K extends keyof T>(
    key: K
  ): Promise<CacheEntry<T[K]> | null> => {
    return new Promise((resolve) => {
      try {
        const item = window.localStorage.getItem(String(key));
        if (item) {
          const parsed = JSON.parse(item);
          resolve(parsed);
        }
      } catch (err) {
        /* istanbul ignore next */
        error(
          { msg: `could not get and parse key '${key}'`, originalErr: err },
          'LS.item'
        );
      }
      resolve(null);
    });
  };

  private getLSKeys = async (): Promise<Array<MappedKeys<T>>> => {
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
        'LS.maybe'
      );
    }
    return result;
  };
}
