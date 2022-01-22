import React, { useState, useRef, useMemo, useCallback } from 'react';
import Search from '@lindeneg/core-search';
import { SearchPredicate, SearchOptions } from '@lindeneg/core-search';

export default function useSearch<T extends unknown[]>(
  obj: T,
  predicate: SearchPredicate<T>,
  opts: SearchOptions<T> = {}
) {
  const [query, setQuery] = useState('');
  const search = useRef(new Search(obj, predicate, opts));

  const onQueryChange = useCallback(
    (target: string | React.FormEvent<HTMLInputElement>) => {
      setQuery(
        typeof target === 'string' ? target : target.currentTarget.value
      );
    },
    []
  );

  const filtered = <T>useMemo(() => {
    return search.current.filter(query);
  }, [query]);

  return {
    filtered,
    query,
    onQueryChange,
  };
}
