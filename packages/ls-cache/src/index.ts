import Logger from '@lindeneg/logger';
import Cache from '@lindeneg/cache';
import type { EmptyObj } from '@lindeneg/types';
import type { CacheEntry, CacheConfig } from '@lindeneg/cache';

const { error } = new Logger(
  '@lindeneg/ls-cache',
  /* istanbul ignore next */
  () => process.env.NODE_ENV === 'development'
);

type Config<T extends EmptyObj> = Partial<Omit<CacheConfig<T>, 'data'>>;

export default class LS<T extends EmptyObj> extends Cache<T> {
  private readonly prefix: string;
  private readonly regex: RegExp;

  constructor(prefix: string, config?: Config<T>) {
    super(config);
    this.prefix = prefix.replace(/[^a-z0-9_]/gi, '');
    this.regex = new RegExp(`^${this.prefix}(.+)$`);

    this.initializeFromLS();
    this.initializeListeners();
  }

  private initializeFromLS = (): void => {
    this.maybe(async () => {
      this.LSEach(async (key) => {
        const value = await this.item(key);
        if (value !== null) {
          this.setEntry(key, value);
        }
      });
    });
  };

  private initializeListeners = (): void => {
    this.on('set', this.onSetListener);
    this.on('remove', this.onRemoveListener);
    this.on('trim', this.onTrimListener);
    this.on('clear', this.onClearListener);
  };

  private onSetListener = <K extends keyof T>(
    key: K,
    value: CacheEntry<T[K]>
  ): void => {
    this.maybe(async () => {
      window.localStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(value)
      );
    });
  };

  private onRemoveListener = <T extends EmptyObj>(key: keyof T): void => {
    this.maybe(async () => {
      window.localStorage.removeItem(`${this.prefix}${key}`);
    });
  };

  private onClearListener = (): void => {
    this.maybe(async () => {
      this.LSEach(async (key) => {
        this.onRemoveListener(key);
      });
    });
  };

  private onTrimListener = (keys: Array<keyof T>): void => {
    this.maybe(async () => {
      keys.forEach((key) => {
        this.onRemoveListener(key);
      });
    });
  };

  private item = async <K extends keyof T>(
    key: K
  ): Promise<CacheEntry<T[K]> | null> => {
    return this.maybe(async () => {
      const item = window.localStorage.getItem(`${this.prefix}${key}`);
      if (item) {
        try {
          return JSON.parse(item);
        } catch (err) {
          error(
            { msg: `could not parse key '${key}'`, originalErr: err },
            'LS.item'
          );
        }
      }
      return null;
    });
  };

  private maybe = async <T>(cb: () => Promise<T>) => {
    try {
      return cb();
    } catch (err) {
      error(
        { msg: 'failed to access localStorage', originalErr: err },
        'LS.maybe'
      );
    }
    return null;
  };

  private LSEach = async (cb: (match: keyof T) => Promise<void>) => {
    for (const key in window.localStorage) {
      if (typeof window.localStorage[key] !== 'undefined') {
        const match = this.regex.exec(key);
        if (match && match.length > 1) {
          cb(match[1]);
        }
      }
    }
  };
}
