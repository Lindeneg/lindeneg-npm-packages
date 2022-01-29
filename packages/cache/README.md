### @lindeneg/cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/cache) ![license](https://badgen.net/npm/license/@lindeneg/cache)

Utility class for caching data.

Used by: [@lindeneg/memory-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/memory-cache) | [@lindeneg/ls-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/ls-cache)

### Installation

`yarn add @lindeneg/cache`

### Usage

```ts
const cache = new Cache();

// set item
cache.set('id', 5);

// or with async
await cache.setAsync('id', 5);

// listen to events
cache.on('trim', (removed) => {
  console.log(removed);
});

// and so on..
```

#### Config

| Name | Required | Ref | Type                                                                     | Default | Description                             |
| ---- | -------- | --- | ------------------------------------------------------------------------ | ------- | --------------------------------------- |
| data | N        | T   | `Record<string \| number \| symbol, { expires: number; value: unknown}>` | `{}`    | optional object with initial cache data |
| trim | N        | -   | `number`                                                                 | `600`   | optional trimming interval in seconds.  |
| ttl  | N        | -   | `number`                                                                 | `3600`  | optional time-to-live in seconds.       |

#### Methods

| Name                 | Types - Note: `K extends keyof T`                                                                                 | Description                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| get                  | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | gets entry, use `getAsync` for promise                            |
| value                | `(key: K) => T[K] \| null`                                                                                        | gets entry value, use `valueAsync` for promise                    |
| set                  | `(key: K, value: T[K]) => { expires: number; value: T[K] }`                                                       | sets entry, use `setAsync` for promise                            |
| remove               | `(key: K) => { expires: number; value: T[K] } \| null`                                                            | removes entry, use `removeAsync` for promise                      |
| has                  | `(key: K) => boolean`                                                                                             | check if entry exists                                             |
| size                 | `() => number`                                                                                                    | get size of cache                                                 |
| keys                 | `() => Array<K>`                                                                                                  | get array of defined keys                                         |
| clear                | `() => void`                                                                                                      | clear cache, use `clearAsync` for promise                         |
| destruct             | `() => void`                                                                                                      | destroy cache, removes trim listener                              |
| createEntry          | `(value: unknown) => { expires: number; value: unknown }`                                                         | create a cache entry                                              |
| `static` createEntry | `(value: unknown, ttl = 3600) => { expires: number; value: unknown }`                                             | create a cache entry without instantiating a new instance         |
| on                   | `(event: "set" \| "remove" \| "clear" \| "destruct" \| "trim", callback: ((...args: unknown[]) => void)) => void` | set event callback, supports multiple listeners on the same event |
