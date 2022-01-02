import { CacheData, CacheEntry } from "./cache";
import { EmptyObj } from "../shared";

export class LS {
  public static get = <T extends EmptyObj>() => {
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

  public static set = <T extends EmptyObj, K extends keyof T>(
    key: K,
    value: CacheEntry<T[K]>
  ) => {
    LS.maybe(() => {
      window.localStorage.setItem(`__clch__${key}`, JSON.stringify(value));
    });
  };

  public static remove = <T extends EmptyObj>(key: keyof T) => {
    LS.maybe(() => {
      window.localStorage.removeItem(`__clch__${key}`);
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
      const item = window.localStorage.getItem(`__clch__${key}`);
      if (item) {
        try {
          return JSON.parse(item);
        } catch (err) {
          console.error("cl-react-hooks could not parse key: " + key);
          console.error(err);
        }
      }
      return null;
    });
  };

  private static maybe = <T>(cb: () => T) => {
    try {
      return cb();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("cl-react-hooks could not use localStorage for cache.");
        console.error(err);
      }
    }
    return null;
  };

  private static each = <T extends EmptyObj>(cb: (match: keyof T) => void) => {
    for (const key in window.localStorage) {
      if (typeof window.localStorage[key] !== "undefined") {
        const match = /^__clch__(.+)/.exec(key);
        if (match && match.length > 1) {
          cb(match[1]);
        }
      }
    }
  };
}
