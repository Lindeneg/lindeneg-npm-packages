import React, { useState, useRef, useCallback } from 'react';
import Search from '@lindeneg/core-search';
import useMemoryCache from '@lindeneg/memory-cache';
import type { SearchPredicate, SearchOptions } from '@lindeneg/core-search';

type SearchCache<T extends unknown[]> = {
  [k: number]: T;
};

function hashCode(s: string) {
  let h = s.length;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;

  return h;
}

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
    const key = hashCode(queryRef.current + String(predicateRef.current));
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

  return {
    filtered,
    onQueryChange,
    onPredicateChange,
  };
}
