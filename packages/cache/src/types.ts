import type { EmptyObj } from '@lindeneg/types';

export type CacheConfig<T extends EmptyObj> = {
  trim: number;
  ttl: number;
  data: CacheData<T>;
};

export type CacheEntry<T> = {
  expires: number;
  value: T;
};

export type CacheData<T extends EmptyObj> = Partial<{
  [K in keyof T]: CacheEntry<T[K]>;
}>;

export type ListenerConstraint =
  | 'remove'
  | 'clear'
  | 'clearTrimListener'
  | 'trim'
  | 'set';

export type ListenerCallback<
  T extends EmptyObj,
  K extends ListenerConstraint
> = K extends 'trim'
  ? (removed: Array<keyof T>) => void
  : K extends 'set'
  ? (key: keyof T, entry: CacheEntry<T[keyof T]>) => void
  : K extends 'remove'
  ? (key: keyof T) => void
  : () => void;

export type Listeners<T extends EmptyObj> = Partial<{
  [K in ListenerConstraint]: Array<ListenerCallback<T, K>>;
}>;
