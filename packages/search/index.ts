import { EmptyObj } from '@lindeneg/types';

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

type EntryConstraint = EmptyObj | EmptyObj[];

type KeyConstraint<T extends unknown[]> = [
  TargetKeyConstraint<T[number]>,
  ...TargetKeyConstraint<T[number]>[]
];

type SanitizeMode = 'strict' | 'lenient';

type PredicateFn<T extends unknown[]> = (
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

const sanitize = function (str: string, mode: SanitizeMode) {
  const isStrict = mode === 'strict';
  return str.replace(/[^a-z0-9]/gi, (match) => {
    return isStrict || match === '\\' ? ' ' : '\\' + match;
  });
};

function reduceToString(obj: EmptyObj[], key: string | null) {
  return obj.reduce((a, b) => {
    const val = key ? b[key] : b;
    return a + ' ' + (val ? String(val) : '');
  }, '');
}

function handleArray(keys: string[], current: EmptyObj[]) {
  const nKeys = keys.slice(1);
  const result =
    nKeys.length > 0
      ? current.reduce((a, b) => a + ' ' + getNestedValue(b, nKeys), '')
      : reduceToString(current, null);
  return result;
}

function getNestedValue(obj: EntryConstraint, keys: string[]): string {
  const isArray = Array.isArray(obj);
  if (keys.length === 1) {
    const result = isArray ? reduceToString(obj, null) : obj[keys[0]];
    return result ? String(result) : '';
  }
  const newKeys = [...keys];
  const [key] = newKeys.splice(0, 1);
  const cur = <EntryConstraint>(!isArray ? obj[key] : obj[0]);
  if (!cur) {
    return '';
  } else if (Array.isArray(cur) && newKeys[0] === 'n') {
    return handleArray(newKeys, cur);
  } else {
    return getNestedValue(cur, newKeys);
  }
}

function _filter<T extends unknown[]>(
  obj: T,
  keys: KeyConstraint<T>,
  query: string,
  mode: SanitizeMode
): T {
  const sanitized = sanitize(query, mode).trim();
  if (!sanitized) {
    return obj;
  }
  const uniqueKeys = Array.from(new Set(keys))
    .map((e) => e.split('.'))
    .sort();
  return <T>obj.filter((entry) => {
    if (entry) {
      try {
        const targets = uniqueKeys.reduce(
          (a, b) => a + ' ' + getNestedValue(<EntryConstraint>entry, b),
          ''
        );
        return new RegExp(sanitized, 'gi').test(targets);
      } catch (err) {
        process.env.NODE_ENV === 'development' &&
          console.error('@lindeneg/search Error: failed with query: ', query);
      }
    }
    return false;
  });
}

export default class Search<T extends unknown[]> {
  private readonly obj: T;
  private readonly predicate: SearchPredicate<T>;
  private readonly mode: SanitizeMode;
  private readonly sort: SearchOptions<T>['sort'];

  constructor(obj: T, predicate: SearchPredicate<T>, opts?: SearchOptions<T>) {
    this.obj = obj;
    this.predicate = predicate;
    this.mode = opts?.mode || 'lenient';
    this.sort = opts?.sort;
  }

  public filter(query: string) {
    return this.search(query);
  }

  private search(query: string) {
    let data: T;
    if (Array.isArray(this.predicate)) {
      data = _filter<T>(this.obj, this.predicate, query, this.mode);
    } else if (typeof this.predicate === 'function') {
      data = <T>(
        this.obj.filter((entry, index) =>
          (<PredicateFn<T>>this.predicate)(query, <T[number]>entry, index)
        )
      );
    } else {
      data = this.obj;
    }
    return this.sort ? [...data].sort(this.sort) : data;
  }
}
