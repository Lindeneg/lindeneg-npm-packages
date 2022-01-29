import type { EmptyObj, SafeOmit } from '@lindeneg/types';
import type { CacheConfig } from '@lindeneg/cache';

export type Config<T extends EmptyObj> = Partial<
  SafeOmit<CacheConfig<T>, 'data'>
> & {
  prefix?: string;
  delayInit?: boolean;
};

export type MappedKeys<T extends EmptyObj> = {
  lKey: string;
  pKey: keyof T;
};
