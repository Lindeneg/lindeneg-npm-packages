### @lindeneg/memory-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/memory-cache@1.1.6) ![license](https://badgen.net/npm/license/@lindeneg/memory-cache)

[Sandbox](https://codesandbox.io/s/lindeneg-memory-cache-5ygvx)

---

React hook for caching data in-memory. If you'd like to make the cache persistent, take a look at [@lindeneg/browser-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/browser-cache).

### Installation

`yarn add @lindeneg/memory-cache`

### Usage

```tsx
import useMemoryCache from '@lindeneg/memory-cache';

function SomeComponent() {
  const { cache } = useMemoryCache<{ id: number }>();

  // set item
  cache.set('id', 1);

  // get item
  cache.get('id');

  // listen to event
  cache.on('trim', (removed) => {
    console.log('trim removed these keys from cache: ', removed);
  });

  // and so on
}
```

The documentation [here](https://github.com/Lindeneg/lindeneg-npm-packages/tree/master/packages/cache) can be used.
