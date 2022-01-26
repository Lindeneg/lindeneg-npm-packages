import { useRef, useEffect } from 'react';
import LS from '@lindeneg/ls-cache';
import type { CacheConfig } from '@lindeneg/cache';
import type { EmptyObj } from '@lindeneg/types';

type Config<T extends EmptyObj> = Partial<Omit<CacheConfig<T>, 'data'>> & {
  prefix?: string;
};

export default function useBrowserCache<T extends EmptyObj>({
  prefix = '__clch__',
  ...config
}: Config<T>) {
  const ref = useRef<LS<T>>(new LS(prefix, config));

  useEffect(() => {
    return () => {
      const { current } = ref;
      current.destruct();
    };
  }, []);

  return { cache: ref.current };
}
