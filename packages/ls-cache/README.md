### @lindeneg/ls-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/ls-cache) ![license](https://badgen.net/npm/license/@lindeneg/ls-cache)

---

Utility class for interacting with [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

Used by: [@lindeneg/browser-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/browser-cache)

### Installation

`yarn add @lindeneg/ls-cache`

### Usage

```ts
import LS from '@lindeneg/ls-cache';

// default usage
const ls = new LS();

// async usage
const ls = new LS({
  delayInit: true,
});

await ls.initialize();
```

#### Config

| Name      | Required | Type      | Default           | Description                                  |
| --------- | -------- | --------- | ----------------- | -------------------------------------------- |
| prefix    | N        | `string`  | `__cl_ls_cache__` | prefix localStorage keys to avoid collisions |
| delayInit | N        | `boolean` | `false`           | delay localStorage initialization            |
| trim      | N        | `number`  | `600`             | trimming interval in seconds.                |
| ttl       | N        | `number`  | `3600`            | time-to-live in seconds.                     |

#### Methods

| Name                 | Types                                                                                                             | Description                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| initialize           | `() => Promise<LS<T>>`                                                                                            | initializes localStorage collection and internal listeners        |
| get                  | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | gets entry, use `getAsync` for promise                            |
| value                | `(key: K) => T[K] \| null`                                                                                        | gets entry value, use `valueAsync` for promise                    |
| set                  | `(key: K, value: T[K]) => { expires: number; value: T[K] }`                                                       | sets entry, use `setAsync` for promise                            |
| remove               | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | removes entry, use `removeAsync` for promise                      |
| has                  | `(key: K) => boolean`                                                                                             | check if entry exists                                             |
| size                 | `() => number`                                                                                                    | get size of cache                                                 |
| keys                 | `() => Array`                                                                                                     | get array of defined keys                                         |
| clear                | `() => void`                                                                                                      | clear cache, use `clearAsync` for promise                         |
| destruct             | `() => void`                                                                                                      | destroy cache, removes trim listener                              |
| createEntry          | `(value: unknown) => { expires: number; value: unknown }`                                                         | create a cache entry                                              |
| `static` createEntry | `(value: unknown, ttl = 3600) => { expires: number; value: unknown }`                                             | create a cache entry without instantiating a new instance         |
| on                   | `(event: "set" \| "remove" \| "clear" \| "destruct" \| "trim", callback: ((...args: unknown[]) => void)) => void` | set event callback, supports multiple listeners on the same event |
