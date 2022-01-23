### @lindeneg/cache

Utility class for caching data | [bundle-size](https://bundlephobia.com/package/@lindeneg/cache)

Used by: [@lindeneg/memory-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/memory-cache) | [@lindeneg/browser-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/browser-cache)

### Installation

`yarn add @lindeneg/cache`

### Usage

```ts
// config object is optional
const cache = new Cache({
  trim: 600, // default value, in seconds
  ttl: 3600, // default value, in seconds,
  data: {}, // initial data
});

// set item
cache.set('id', 5);
await cache.setAsync('id', 5);

// get item CacheEntry
cache.get('id');
await cache.getAsync('id');

// get item value
cache.value('id');
await cache.valueAsync('id');

// remove item
cache.remove('id');
await cache.removeAsync('id');

// listen to events
cache.on('trim', (removed) => {
  console.log(removed);
});

// destroy cache
cache.destruct();

// and more..
```

##### CacheEntry

```ts
type CacheEntry<T> = {
  expires: number;
  value: T;
};
```
