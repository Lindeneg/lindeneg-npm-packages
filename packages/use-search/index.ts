import React, { useState, useMemo, useCallback } from 'react';
import Search from '@lindeneg/search';

export default function useSearch<T extends unknown[]>(
  obj: T,
  predicate:
    | KeyConstraint<T>
    | ((value: string, item: T[number], index: number) => boolean),
  opts: UseSearchOptions<T> = {}
) {
  const [query, setQuery] = useState('');

  const { mode = 'lenient', sort } = opts;

  const onQueryChange = useCallback(
    (target: string | React.FormEvent<HTMLInputElement>) => {
      setQuery(
        typeof target === 'string' ? target : target.currentTarget.value
      );
    },
    []
  );

  const filtered = <T>useMemo(() => {
    const data = Array.isArray(predicate)
      ? filter<T>(obj, predicate, query, mode)
      : obj.filter((entry, index) => predicate(query, <T[number]>entry, index));
    return sort ? [...data].sort(sort) : data;
  }, [obj, query, predicate, sort]);

  return {
    filtered,
    query,
    onQueryChange,
  };
}
