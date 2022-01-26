import { useState, useCallback, useMemo, useEffect } from 'react';

export default function useQueryParams<T extends Record<string, string>>(
  params: T
) {
  const [query, setQuery] = useState<URLSearchParams>(() => {
    const initial = new URLSearchParams(
      /* istanbul ignore next */
      window?.document?.location?.search || ''
    );
    Object.keys(params).forEach((key) => {
      const entry = params[key];
      const current = initial.get(key);
      const val = current || entry;
      if (val) {
        initial.set(key, val);
      }
    });
    return initial;
  });

  const onParamChange = useCallback(
    (type: keyof T, value) => {
      setQuery((prev) => {
        const newSearch = new URLSearchParams(prev);
        const fallback = params[type];
        if (value || fallback) {
          newSearch.set(<string>type, value || fallback);
        } else {
          newSearch.delete(<string>type);
        }
        return newSearch;
      });
    },
    [params]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.pushState) {
      const url =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        '?' +
        query.toString();
      window.history.pushState({ path: url }, '', url);
    }
  }, [query]);

  const values = <T>useMemo(() => {
    return Object.keys(params).reduce((a, b) => {
      return {
        ...a,
        [b]: query.get(b) || params[b],
      };
    }, {});
  }, [params, query]);

  return {
    values,
    onParamChange,
  };
}
