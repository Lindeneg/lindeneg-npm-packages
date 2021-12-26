import { useEffect, useRef } from "react";
import Cache from "./cache";
import { EmptyObj } from "../shared";

export default function useMemoryCache<T extends EmptyObj>() {
  const cache = useRef<Cache<{ hello: { there: string }; sa: boolean }>>(
    new Cache()
  );

  useEffect(() => {
    const { current } = cache;
    return () => {
      current.destruct();
    };
  }, []);

  cache.current.set("hello", { there: "" });
  cache.current.set("sa", false);
  const l = cache.current.get("hello");

  l?.value.there;
}
