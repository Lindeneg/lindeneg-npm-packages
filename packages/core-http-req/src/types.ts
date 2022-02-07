import type { CacheConfig } from '@lindeneg/cache';
import type { SafeOmit, Substitute, EmptyObj } from '@lindeneg/types';
import { CacheStrategy, ReqMethod } from './constants';

export type CustomError = Partial<Error>;

export type RequestResult<T, E extends CustomError> = {
  data?: T;
  error?: E;
  fromCache?: boolean;
  statusCode?: number;
};

export type PromiseRequestResult<T, E extends CustomError> = Promise<
  RequestResult<T, E>
>;

export type RequestConfig = Substitute<
  SafeOmit<
    {
      [K in keyof RequestInit]: RequestInit[K];
    },
    'signal'
  >,
  { method?: ReqMethod }
>;

export type PartialRequestConfig = SafeOmit<RequestConfig, 'method' | 'body'>;

export type HttpReqConstructor = {
  baseUrl?: string;
  sharedOptions?: RequestConfig;
  cacheConfig?: Partial<SafeOmit<CacheConfig<EmptyObj>, 'data'>> & {
    strategy: CacheStrategy;
  };
  shouldSetListeners?: boolean;
};
