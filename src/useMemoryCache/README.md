### useMemoryCache

Hook for caching data in-memory. If you'd like to make the cache persistent, take a look at [useBrowserCache](https://github.com/lindeneg/cl-react-hooks/tree/master/src/useBrowserCache).

---

#### Arguments

**Optional:** an `object` with the below type or a `function` that returns such an object.

| Name | Required | Ref | Type                                                                     | Description                                           |
| ---- | -------- | --- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| data | N        | T   | `Record<string \| number \| symbol, { expires: number; value: unknown}>` | optional object with initial cache data               |
| trim | N        | -   | `number`                                                                 | optional trimming interval in seconds. Default: `600` |
| ttl  | N        | -   | `number`                                                                 | optional time-to-live in seconds. Default: `3600`     |

#### Return

A `function` that returns a `Cache` instance with these methods exposed:

| Name        | Type                                                                                                              | Description                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| get         | `<K extends keyof T>(key: K) => { expires: number; value: T[K] } \| null`                                         | get an item                     |
| value       | `<K extends keyof T>(key: K) => T[K] \| null`                                                                     | get only the value of an item   |
| set         | `<K extends keyof T>(key: K, value: T[K]) => void`                                                                | set an item                     |
| remove      | `(key: keyof T) => void`                                                                                          | remove an item                  |
| has         | `(key: keyof T) => boolean`                                                                                       | check if item exists            |
| size        | `() => number`                                                                                                    | get the size of cache           |
| keys        | `() => Array<keyof T>`                                                                                            | get array of defined cache keys |
| clear       | `() => void`                                                                                                      | clear cache                     |
| destruct    | `() => void`                                                                                                      | destroy cache                   |
| createEntry | `<V>(value: V) => { expires: number; value: V }`                                                                  | create a cache entry            |
| on          | `(event: "set" \| "remove" \| "clear" \| "destruct" \| "trim", callback: ((...args: unknown[]) => void)) => void` | set event callback              |

#### Usage

```tsx
function SomeComponent() {
  const { cache } = useMemoryCache();

  // set item
  cache().set(KEY, VALUE);

  // get item
  cache().get(KEY);

  // get size
  cache().size();

  // listen to event
  cache().on("trim", (removed) => {
    console.log("trim removed these keys from cache: ", removed);
  });

  // and so on
}
```
