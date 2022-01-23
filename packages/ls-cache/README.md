### @lindeneg/ls-cache

Utility class for interacting with [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | [bundle-size](https://bundlephobia.com/package/@lindeneg/ls-cache)

Used by: [@lindeneg/browser-cache](https://github.com/lindeneg/cl-react-hooks/tree/master/packages/browser-cache)

### Installation

`yarn add @lindeneg/ls-cache`

### Usage

```ts
import LS from '@lindeneg/ls-cache';

// set a key prefix to avoid localStorage collisions
LS.setPrefix('__something__');

// set item, second argument in createEntry
// is optional, default is 3600 seconds
LS.set('id', LS.createEntry('some-id', 3600));

// remove an item
LS.remove('id');

// get an item, returns a CacheEntry
LS.get('id');

// get all items
LS.getAll();

// destroy all items
LS.destroy();

// trim items
LS.trim();
```
