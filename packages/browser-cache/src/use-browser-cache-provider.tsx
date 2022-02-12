import React, { createContext, useContext } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { EmptyObj, SafeOmit } from '@lindeneg/types';
import useBrowserCache from './use-browser-cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BrowserCacheContext = createContext<LS<any>>(new LS());

export type BrowserCacheContextProviderProps<T extends EmptyObj> = {
  children: React.ReactNode;
  config?: SafeOmit<Config<T>, 'delayInit'>;
};

export function BrowserCacheContextProvider<T extends EmptyObj>({
  children,
  config,
}: BrowserCacheContextProviderProps<T>) {
  const { cache } = useBrowserCache<T>(config);
  return (
    <BrowserCacheContext.Provider value={cache}>
      {children}
    </BrowserCacheContext.Provider>
  );
}

export function useCacheContext<T extends EmptyObj>() {
  const cache = useContext<LS<T>>(BrowserCacheContext);
  return { cache };
}