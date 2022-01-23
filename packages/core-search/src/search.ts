import { $filter } from './util';
import type {
  SearchPredicate,
  SearchOptions,
  PredicateFn,
  SanitizeMode,
} from './types';

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
      data = $filter<T>(this.obj, this.predicate, query, this.mode);
    } else if (typeof this.predicate === 'function') {
      data = <T>(
        this.obj.filter((entry, index) =>
          (<PredicateFn<T>>this.predicate)(query, <T[number]>entry, index)
        )
      );
    } else {
      data = this.obj;
    }
    return this.sort ? <T>[...data].sort(this.sort) : data;
  }
}
