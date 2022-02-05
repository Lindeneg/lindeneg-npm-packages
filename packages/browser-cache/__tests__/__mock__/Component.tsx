import React, { useState } from 'react';
import { useCacheContext } from '../../src';

export type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

export function Component() {
  const cache = useCacheContext<TestObj>();
  const [keys, setKeys] = useState(cache.keys());

  const onSomething = (type: string) => {
    if (type === 'add') {
      cache.set('id', 55);
    } else {
      cache.remove('id');
    }
    setKeys(cache.keys());
  };

  return (
    <div>
      <div data-testid="some-id">
        {keys.map((key) => {
          const value = cache.get(key);
          return (
            <div
              key={key}
              data-testid={key}
              data-value={JSON.stringify(value)}
            />
          );
        })}
      </div>
      <button data-testid="remove-btn" onClick={() => onSomething('remove')} />
      <button data-testid="add-btn" onClick={() => onSomething('add')} />
    </div>
  );
}
