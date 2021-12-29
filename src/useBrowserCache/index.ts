import { useRef } from "react";
import useMemoryCache from "../useMemoryCache";
import { Cache, CacheConfig, LS } from "../cache";
import { EmptyObj } from "../shared";

type Config<T extends EmptyObj> = Omit<CacheConfig<T>, "data">;

export default function useBrowserCache<T extends EmptyObj>(
  config?: Partial<Config<T>> | (() => Partial<Config<T>>)
) {
  const _config = useRef(typeof config === "function" ? config() : config);
  const { cache } = useMemoryCache<T>(() => {
    const stored = LS.get<T>();
    if (stored !== null) {
      return { ..._config.current, data: stored };
    }
    return { ..._config.current };
  });

  cache().on("set", (key, value) => {
    LS.set(key, Cache.createEntry(value, _config.current?.ttl));
  });

  cache().on("remove", (key) => {
    LS.remove(key);
  });

  cache().on("clear", (isDestruct) => {
    if (!isDestruct) {
      LS.destroy();
    }
  });

  cache().on("trim", (keys) => {
    LS.trim(keys);
  });

  return { cache };
}
