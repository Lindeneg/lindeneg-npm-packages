import type { ObjConstraint, SafeOmit } from '@lindeneg/types';
import type { CacheConfig } from '@lindeneg/cache';

export type Config<T extends ObjConstraint<T>> = Partial<
  SafeOmit<CacheConfig<T>, 'data'>
> & {
  prefix?: string;
  delayInit?: boolean;
};

export type MappedKeys<T extends ObjConstraint<T>> = {
  lKey: keyof T;
  pKey: keyof T;
};
