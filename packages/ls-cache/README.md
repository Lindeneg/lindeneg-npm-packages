### @lindeneg/ls-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/ls-cache@2.0.3) ![license](https://badgen.net/npm/license/@lindeneg/ls-cache)

---

Utility class for interacting with [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Installation

`yarn add @lindeneg/ls-cache`

### Usage

```ts
import LSCache from '@lindeneg/ls-cache';

// default usage
const cache = new LSCache();

// async usage
const cache = new LSCache({
  delayInit: true,
});

await cache.initialize();
```

#### Config

```ts
type Config = {
  /* prefix localStorage keys to avoid collisions
     default: '__cl_ls_cache__' */
  prefix?: string;

  /* delay localStorage initialization
     default: false */
  delayInit?: boolean;

  /* trimming interval in seconds 
     default: 600 */
  trim?: number;

  /* time-to-live in seconds 
     default: 3600 */
  ttl?: number;
};
```

#### Methods

The documentation [here](https://github.com/Lindeneg/lindeneg-npm-packages/tree/master/packages/cache#methods) can be used.
