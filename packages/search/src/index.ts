import React, { useState, useRef, useCallback } from 'react';
import Search from '@lindeneg/core-search';
import useMemoryCache from '@lindeneg/memory-cache';
import type { SearchPredicate, SearchOptions } from '@lindeneg/core-search';

type SearchCache<T extends unknown[]> = {
  [k: string]: T;
};

export default function useSearch<T extends unknown[]>(
  obj: T,
  predicate: SearchPredicate<T>,
  opts: SearchOptions<T> = {}
) {
  const { cache } = useMemoryCache<SearchCache<T>>();
  const [filtered, setFiltered] = useState<T>(obj);
  const queryRef = useRef<string>('');
  const predicateRef = useRef<SearchPredicate<T>>(predicate);
  const searchRef = useRef(new Search(obj, predicateRef.current, opts));

  const onFilter = useCallback(() => {
    const key = String(queryRef.current) + String(predicateRef.current);
    const value = cache.value(key);
    if (value) {
      setFiltered(value);
    } else {
      const entry = searchRef.current.filter(queryRef.current);
      cache.set(key, entry);
      setFiltered(entry);
    }
  }, [cache]);

  const onQueryChange = useCallback(
    (target: string | React.FormEvent<HTMLInputElement>) => {
      queryRef.current =
        typeof target === 'string' ? target : target.currentTarget.value;
      onFilter();
    },
    [onFilter]
  );

  const onPredicateChange = useCallback(
    (predicate: SearchPredicate<T>) => {
      searchRef.current.setPredicate(predicate);
      predicateRef.current = predicate;
      onFilter();
    },
    [onFilter]
  );

  const query = queryRef.current;

  return {
    filtered,
    query,
    onQueryChange,
    onPredicateChange,
  };
}
