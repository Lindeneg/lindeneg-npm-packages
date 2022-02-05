import { useRef, useEffect } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { EmptyObj, SafeOmit } from '@lindeneg/types';

export default function useBrowserCache<T extends EmptyObj>(
  config?: SafeOmit<Config<T>, 'delayInit'>
) {
  const cacheRef = useRef<LS<T>>(new LS(config));

  useEffect(() => {
    return () => {
      const { current } = cacheRef;
      // removes trim interval
      current.destruct();
    };
  }, []);

  return { cache: cacheRef.current };
}
