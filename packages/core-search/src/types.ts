import type { EmptyObj } from '@lindeneg/types';

type Concat<K, P> = K extends string | number
  ? P extends string | number
    ? `${K extends number ? 'n' : K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Depth = [never, 0, 1, 2, 3, 4, 5, ...0[]];

type TargetKeyConstraint<T, U extends number = 5> = U extends never
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: Concat<K, TargetKeyConstraint<T[K], Depth[U]>>;
    }[keyof T]
  : '';

export type EntryConstraint = EmptyObj | EmptyObj[];

export type KeyConstraint<T extends unknown[]> = [
  TargetKeyConstraint<T[number]>,
  ...TargetKeyConstraint<T[number]>[]
];

export type SanitizeMode = 'strict' | 'lenient';

export type PredicateFn<T extends unknown[]> = (
  value: string,
  item: T[number],
  index: number
) => boolean;

export type SearchOptions<T extends unknown[]> = {
  mode?: SanitizeMode;
  sort?: (a: T[number], b: T[number]) => number;
};

export type SearchPredicate<T extends unknown[]> =
  | KeyConstraint<T>
  | PredicateFn<T>;
