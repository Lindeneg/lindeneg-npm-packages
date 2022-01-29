### @lindeneg/memory-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/memory-cache) ![license](https://badgen.net/npm/license/@lindeneg/memory-cache)

---

Hook for caching data in-memory. If you'd like to make the cache persistent, take a look at [@lindeneg/browser-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/browser-cache).

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

#### Config

| Name | Required | Ref | Type                                                                     | Default | Description                             |
| ---- | -------- | --- | ------------------------------------------------------------------------ | ------- | --------------------------------------- |
| data | N        | T   | `Record<string \| number \| symbol, { expires: number; value: unknown}>` | `{}`    | optional object with initial cache data |
| trim | N        | -   | `number`                                                                 | `600`   | optional trimming interval in seconds.  |
| ttl  | N        | -   | `number`                                                                 | `3600`  | optional time-to-live in seconds.       |

#### Methods

| Name        | Types - Note: `K extends keyof T`                                                                                 | Description                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| get         | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | gets entry, use `getAsync` for promise                            |
| value       | `(key: K) => T[K] \| null`                                                                                        | gets entry value, use `valueAsync` for promise                    |
| set         | `(key: K, value: T[K]) => { expires: number; value: T[K] }`                                                       | sets entry, use `setAsync` for promise                            |
| remove      | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | removes entry, use `removeAsync` for promise                      |
| has         | `(key: K) => boolean`                                                                                             | check if entry exists                                             |
| size        | `() => number`                                                                                                    | get size of cache                                                 |
| keys        | `() => Array`                                                                                                     | get array of defined keys                                         |
| clear       | `() => void`                                                                                                      | clear cache, use `clearAsync` for promise                         |
| destruct    | `() => void`                                                                                                      | destroy cache, removes trim listener                              |
| createEntry | `(value: unknown) => { expires: number; value: unknown }`                                                         | create a cache entry                                              |
| on          | `(event: "set" \| "remove" \| "clear" \| "destruct" \| "trim", callback: ((...args: unknown[]) => void)) => void` | set event callback, supports multiple listeners on the same event |
