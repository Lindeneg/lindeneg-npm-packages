### @lindeneg/browser-cache

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/browser-cache@1.2.2) ![license](https://badgen.net/npm/license/@lindeneg/browser-cache)

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
  const { cache } = useCacheContext<SomeCacheType>();

  // set item
  cache.set('id', 1);

  // and so on

  return <div></div>;
}
```

The documentation [here](https://github.com/Lindeneg/lindeneg-npm-packages/tree/master/packages/ls-cache) can be used.
