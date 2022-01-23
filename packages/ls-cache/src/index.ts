import Logger from '@lindeneg/logger';
import type { EmptyObj } from '@lindeneg/types';
import type { CacheData, CacheEntry } from '@lindeneg/cache';

const { error } = new Logger(
  '@lindeneg/ls-cache',
  () => process.env.NODE_ENV === 'development'
);

export default class LS {
  private static PREFIX = '';
  private static REGEX = /^(.+)$/;

  public static getAll = <T extends EmptyObj>() => {
    return LS.maybe(() => {
      const result: CacheData<T> = {};
      LS.each<T>((key) => {
        const value = LS.item<T, typeof key>(key);
        if (value !== null) {
          result[key] = value;
        }
      });
      return result;
    });
  };

  public static get = <T extends EmptyObj>(key: keyof T) => {
    return LS.maybe(() => {
      return LS.item(key);
    });
  };

  public static setPrefix = (newPrefix: string) => {
    LS.PREFIX = newPrefix;
    LS.REGEX = new RegExp(`^${LS.PREFIX}(.+)$`);
  };

  public static set = <T extends EmptyObj, K extends keyof T>(
    key: K,
    value: CacheEntry<T[K]>
  ) => {
    LS.maybe(() => {
      window.localStorage.setItem(`${LS.PREFIX}${key}`, JSON.stringify(value));
    });
  };

  public static remove = <T extends EmptyObj>(key: keyof T) => {
    LS.maybe(() => {
      window.localStorage.removeItem(`${LS.PREFIX}${key}`);
    });
  };

  public static destroy = () => {
    LS.maybe(() => {
      LS.each((key) => {
        LS.remove(key);
      });
    });
  };

  public static trim = <T extends EmptyObj>(keys: Array<keyof T>) => {
    LS.maybe(() => {
      keys.forEach((key) => {
        LS.remove(key);
      });
    });
  };

  private static item = <T extends EmptyObj, K extends keyof T>(
    key: K
  ): CacheEntry<T[K]> | null => {
    return LS.maybe(() => {
      const item = window.localStorage.getItem(`${LS.PREFIX}${key}`);
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

  private static maybe = <T>(cb: () => T) => {
    try {
      return cb();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        error(
          { msg: 'failed to access localStorage', originalErr: err },
          'LS.maybe'
        );
      }
    }
    return null;
  };

  private static each = <T extends EmptyObj>(cb: (match: keyof T) => void) => {
    for (const key in window.localStorage) {
      if (typeof window.localStorage[key] !== 'undefined') {
        const match = LS.REGEX.exec(key);
        if (match && match.length > 1) {
          cb(match[1]);
        }
      }
    }
  };
}
