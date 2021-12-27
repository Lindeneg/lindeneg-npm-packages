import { useEffect, useRef } from "react";
import Cache, { CacheConfig } from "./cache";
import { EmptyObj } from "../shared";

export default function useMemoryCache<T extends EmptyObj>(
  config?: Partial<CacheConfig<T>> | (() => Partial<CacheConfig<T>>)
) {
  const ref = useRef<Cache<T>>(
    new Cache(typeof config === "function" ? config() : config)
  );

  useEffect(() => {
    const { current } = ref;
    return () => {
      current.destruct();
    };
  }, []);

  const cache = () => {
    return ref.current;
  };

  return { cache };
}
