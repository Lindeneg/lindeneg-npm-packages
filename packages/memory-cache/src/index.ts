import { useEffect, useRef } from 'react';
import Cache from '@lindeneg/cache';
import type { CacheConfig } from '@lindeneg/cache';
import type { ObjConstraint, EmptyObj } from '@lindeneg/types';

export default function useMemoryCache<T extends ObjConstraint<T> = EmptyObj>(
  config?: Partial<CacheConfig<T>>
) {
  const ref = useRef<Cache<T>>(new Cache(config));

  useEffect(() => {
    return () => {
      const { current } = ref;
      current.clearTrimListener();
    };
  }, []);

  return { cache: ref.current };
}
