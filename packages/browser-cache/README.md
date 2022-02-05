### @lindeneg/browser-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/browser-cache) ![license](https://badgen.net/npm/license/@lindeneg/browser-cache)

[Sandbox](https://codesandbox.io/s/lindeneg-browser-cache-q502j)

---

Hook for caching data in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

### Installation

`yarn add @lindeneg/browser-cache`

### Usage

```tsx
import useBrowserCache from '@lindeneg/browser-cache';

type SomeCacheType = {
  ...
}

function SomeComponent() {
  const { cache } = useBrowserCache<SomeCacheType>(config);

  // set item
  cache.set('id', 1);

  // get item
  cache.value('id');

  // listen to event
  cache.on('trim', (removed) => {
    console.log('trim removed these keys from cache: ', removed);
  });

  // and so on
}
```

Or with `React.Context` for a shared cache to be used by multiple components.

```tsx
import {
  BrowserCacheContextProvider,
  useCacheContext,
} from '@lindeneg/browser-cache';

function ProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <BrowserCacheContextProvider config={config}>
      {children}
    </BrowserCacheContextProvider>
  );
}

function ConsumerComponent() {
  const cache = useCacheContext<SomeCacheType>();

  // set item
  cache.set('id', 1);

  // and so on

  return <div></div>;
}
```

#### Config

| Name   | Required | Type     | Default           | Description                                  |
| ------ | -------- | -------- | ----------------- | -------------------------------------------- |
| prefix | N        | `string` | `__cl_ls_cache__` | prefix localStorage keys to avoid collisions |
| trim   | N        | `number` | `600`             | trimming interval in seconds.                |
| ttl    | N        | `number` | `3600`            | time-to-live in seconds.                     |

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
