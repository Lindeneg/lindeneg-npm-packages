import React, { useState, createContext, useContext } from 'react';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { EmptyObj } from '@lindeneg/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CacheContext = createContext<LS<any>>(new LS());

export type CacheContextProviderProps<T extends EmptyObj> = {
  children: React.ReactNode;
  config?: Config<T>;
};

export function CacheContextProvider<T extends EmptyObj>({
  children,
  config,
}: CacheContextProviderProps<T>) {
  const [cache] = useState(new LS<T>(config));
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
}

export function useCacheContext<T extends EmptyObj>() {
  const context = useContext<LS<T>>(CacheContext);
  return context;
}
