### @lindeneg/cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/cache@2.1.4) ![license](https://badgen.net/npm/license/@lindeneg/cache)

---

Utility class for caching data.

### Installation

`yarn add @lindeneg/cache`

### Usage

```ts
import Cache from '@lindeneg/cache';

const cache = new Cache(optionalConfig);

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

```ts
type Config = {
  /* object with initial cache data 
     default: {} */
  data?: Record<
    string | number | symbol,
    // this type is referred to as a: CacheEntry
    { expires: number; value: unknown }
  >;

  /* trimming interval in seconds 
     default: 600 */
  trim?: number;

  /* time-to-live in seconds 
     default: 3600 */
  ttl?: number;
};
```

#### Methods

##### Shared

This cache instance is used in the below examples:

```ts
type T = {
  id: number;
  username: string;
};

const cache = new Cache<T>();
```

##### value, valueAsync

These methods returns the `value` of a desired `CacheEntry`. If an entry is found but it has expired, then it will be removed from cache and the function call will return `null`.

```ts
function value<K extends keyof T>(key: K): T[K] | null;
function valueAsync<K extends keyof T>(key: K): Promise<T[K] | null>;

// type: string | null
const username = cache.value('username');

// type: number | null
const id = await cache.value('id');
```

##### get, getAsync

These methods returns the entire `CacheEntry`, with both the `value` and `expires` properties. If an entry is found but it has expired, then it will be removed from cache and the function call will return `null`.

```ts
function get<K extends keyof T>(key: K): CacheEntry<T[K]> | null;
function getAsync<K extends keyof T>(key: K): Promise<CacheEntry<T[K]> | null>;

// type: { expires: number; value: string } | null
const username = cache.get('username');

// type: { expires: number; value: number } | null
const id = await cache.getAsync('id');
```

##### set, setAsync

These methods always returns the created `CacheEntry`. The `expires` value is deduced from the `ttl` property in the cache `config`, which defaults to 3600 seconds.

```ts
function set<K extends keyof T>(key: K, value: T[K]): CacheEntry<T[K]>;
function setAsync<K extends keyof T>(
  key: K,
  value: T[K]
): Promise<CacheEntry<T[K]>>;

// type: { expires: number; value: string }
const username = cache.set('username', 'miles');

// type: { expires: number; value: number }
const id = await cache.setAsync('id', 1);
```

##### createEntry, Cache.createEntry

There are two methods available to create a `CacheEntry` without saving it in the cache. This can be useful for creating initial cache data compatible with the type constraint of `config.data`.

```ts
// instance method
function createEntry<T>(value: T): CacheEntry<T>;
// static method
function Cache.createEntry<T>(value: T, ttl = 3600): CacheEntry<T>;
```

##### remove, removeAsync

These methods returns the removed `CacheEntry` or `null` if nothing was removed.

```ts
function remove<K extends keyof T>(key: K): CacheEntry<T[K]> | null;
function removeAsync<K extends keyof T>(
  key: K
): Promise<CacheEntry<T[K]> | null>;

// type: { expires: number; value: string } | null
const username = cache.remove('username');

// type: { expires: number; value: number } | null
const id = await cache.removeAsync('id');
```

##### on

This method allows you to attach callbacks to be executed on certain events.

```ts
type ListenerConstraint =
  | 'remove'
  | 'clear'
  | 'clearTrimListener'
  | 'trim'
  | 'set';

function on<K extends ListenerConstraint>(
  event: K,
  callback: ListenerCallback<T, K>
): void;
```

The `ListenerCallback` type is generic because, for example, `set` will provide different arguments than `remove`. We can think about it like so:

```ts
type ListenerCallback<K extends ListenerConstraint> = K extends 'trim'
  ? (removed: Array<keyof T>) => void
  : K extends 'set'
  ? (key: keyof T, entry: CacheEntry<T[keyof T]>) => void
  : K extends 'remove'
  ? (key: keyof T) => void
  : () => void;
```

For example, it can be used like so with types inferred from the `event` argument:

```ts
cache.on('set', (key, entry) => {
  // do something
});

cache.on('trim', (removed) => {
  // do something
});

cache.on('clear', () => {
  // do something
});
```

##### has

Check if an entry exists. If an entry is found but it has expired, then it will be removed from cache and the function call will return `false`.

```ts
function has(key: keyof T): boolean;

const hasId = cache.has('id');
```

##### size

Get the current size of cache.

```ts
function size(): number;

const cacheSize = cache.size();
```

##### keys

Get the keys of the cache.

```ts
function keys(): Array<keyof T>;

const keys = cache.keys();
```

##### clear, clearAsync

Clear the cache.

```ts
function clear(): void;
function clearAsync(): Promise<void>;

cache.clear();
await cache.clearAsync();
```

##### clearTrimListener

Removes the `trim` event listener.

```ts
function clearTrimListener(): void;

cache.clearTrimListener();
```

### Type Safety

Do note, that in order to have type-safety, you either need to pass in a `data` object in the `config` where the types can be inferred from or pass in a generic type argument that describes what you want to cache.

```ts
const cache = new Cache({ id: 1, username: 'christian' });

/* now cache keys 'id' and 'username' are inferred as having types 'number' and 'string', respectively.
   however, this is only really useful if the object you pass in, always describes the entire cache. */

// passing in a generic type argument ensures type-safety in all cache methods
type SomeCacheData = { id: number; username: string };
const cache = new Cache<SomeCacheData>();

/* for example, the first arg in 'cache.set', is now constrained to a union of 'id' | 'username', 
   or K, and the values are constrained to SomeCacheData[K] */

// OK
cache.set('id', 1);
cache.set('username', 'miles');

// TS error
cache.set('id', 'davis');
cache.set('username', 1);

// and so on
```
