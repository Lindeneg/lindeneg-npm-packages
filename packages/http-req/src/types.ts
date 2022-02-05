import type { CacheConfig } from '@lindeneg/cache';
import type { SafeOmit, EmptyObj } from '@lindeneg/types';

export type RequestResult<T> = {
  data?: T;
  error?: Error;
  fromCache?: boolean;
};

export type PromiseRequestResult<T> = Promise<RequestResult<T>>;

export type RequestConfig = {
  [K in keyof RequestInit]: RequestInit[K];
};

export type PartialRequestConfig = SafeOmit<RequestConfig, 'method' | 'body'>;

export type HttpReqConstructor = {
  sharedOptions?: RequestConfig;
  cacheConfig?: SafeOmit<CacheConfig<EmptyObj>, 'data'> & {
    strategy: 'memory' | 'localStorage';
  };
  shouldSetListeners?: boolean;
};
