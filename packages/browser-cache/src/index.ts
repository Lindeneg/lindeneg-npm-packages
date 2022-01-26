import { useRef, useEffect } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { EmptyObj } from '@lindeneg/types';

export default function useBrowserCache<T extends EmptyObj>(
  config?: Config<T>
) {
  const ref = useRef<LS<T>>(new LS(config));

  useEffect(() => {
    return () => {
      const { current } = ref;
      current.destruct();
    };
  }, []);

  return { cache: ref.current };
}
