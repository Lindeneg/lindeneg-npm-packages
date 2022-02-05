import React, { useEffect, useState } from 'react';
import { useCacheContext } from '../../src';

export type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

export function Component() {
  const [s, ss] = useState('');
  const cache = useCacheContext<TestObj>();

  useEffect(() => {
    cache.on('set', (_, entry) => {
      ss(String(entry.value));
    });
  }, [cache]);

  return <div data-testid="some-id">{s}</div>;
}
