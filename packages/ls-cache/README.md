### @lindeneg/ls-cache

Utility class for interacting with [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | [bundle-size](https://bundlephobia.com/package/@lindeneg/ls-cache)

Used by: [@lindeneg/browser-cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/browser-cache)

### Installation

`yarn add @lindeneg/ls-cache`

### Usage

Follows the same usage as: [@lindeneg/cache](https://github.com/lindeneg/lindeneg-npm-packages/tree/master/packages/cache), however a `prefix` may be specified to avoid `localStorage` key collisions.

```ts
import LS from '@lindeneg/ls-cache';

const ls = new LS({
  // all config items are optional, these are defaults
  prefix: '__cl_ls_cache__', // avoids key collisions
  delayInit: false, // allows to initialize when appropriate
  trim: 600, // trim interval in seconds
  ttl: 3600, // entry time-to-live in seconds
});

// with async
const ls = new LS({
  delayInit: true,
});

await ls.initialize();
```
