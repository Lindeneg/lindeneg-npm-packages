import { useRef, useEffect } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { ObjConstraint, SafeOmit, EmptyObj } from '@lindeneg/types';

export default function useBrowserCache<T extends ObjConstraint<T> = EmptyObj>(
  config?: SafeOmit<Config<T>, 'delayInit'>
) {
  const cacheRef = useRef<LS<T>>(new LS(config));

  useEffect(() => {
    return () => {
      const { current } = cacheRef;
      current.clearTrimListener();
    };
  }, []);

  return { cache: cacheRef.current };
}
