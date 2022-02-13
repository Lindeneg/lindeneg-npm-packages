import React, { createContext, useContext } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { ObjConstraint, SafeOmit } from '@lindeneg/types';
import useBrowserCache from './use-browser-cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BrowserCacheContext = createContext<LS<any>>(new LS());

export type BrowserCacheContextProviderProps<T extends ObjConstraint<T>> = {
  children: React.ReactNode;
  config?: SafeOmit<Config<T>, 'delayInit'>;
};

export function BrowserCacheContextProvider<T extends ObjConstraint<T>>({
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

export function useCacheContext<T extends ObjConstraint<T>>() {
  const cache = useContext<LS<T>>(BrowserCacheContext);
  return { cache };
}
