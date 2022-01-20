### useQueryParams

Hook using [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

[Sandbox](https://codesandbox.io/s/lindeneg-query-params-rnmi9?file=/src/App.tsx) | [Size](https://bundlephobia.com/package/@lindeneg/query-params)

### Installation

`yarn add @lindeneg/query-params`

---

#### Arguments

| Name   | Required | Ref | Type                     | Description                                        |
| ------ | -------- | --- | ------------------------ | -------------------------------------------------- |
| params | Y        | T   | `Record<string, string>` | object with param keys and optional default values |

#### Return

Object with properties:

| Name          | Type                                      | Description                      |
| ------------- | ----------------------------------------- | -------------------------------- |
| values        | `T`                                       | object with current param values |
| onParamChange | `(type: keyof T, value: string) => void;` | change param value               |

#### Usage

```tsx
function SomeComponent() {
  const { values, onParamChange } = useQueryParams({
    id: "",
    context: "",
    // optional default value
    sort: "desc",
  });
}
```

This will result in `window.location.search` having the value `?sort=desc`. If `sort` also was an empty string, then `window.location.search` would be empty.

Update param as follows:

```ts
onParamChange("context", "products");
```

Now `window.location.search` will be `?context=products&sort=desc`

To remove it, use an empty string:

```ts
onParamChange("context", "");
```

Now `window.location.search` will be `?sort=desc`

If default values are specified, an empty string will not remove the key but rather use the default value instead.

So, if `sort` is changed

```ts
onParamChange("sort", "asc");
```

Then `window.location.search` will of course be `?sort=asc`

However, if the key is removed

```ts
onParamChange("sort", "");
```

The default value will be used and `window.location.search` will be `?sort=desc`
