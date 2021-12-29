### useHttp

Hook to send HTTP requests using [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

#### Returns

An **object** with type:

| Name      | Type                            | Description                             |
| --------- | ------------------------------- | --------------------------------------- | -------------------- |
| isLoading | `boolean`                       | `true` if ongoing request else `false`  |
| error     | `(E extends {message?: string}) | null`                                   | request error object |
| request   | `Function`                      | send request, receive `Response` object |
| withJson  | `Function`                      | send request, receive `JSON` object     |

`request` and `withJson` have the following types:

```ts
type BodyConstraint = Record<string | number | symbol, unknown>;

type RequestArgs<T extends BodyConstraint> = {
  url: string;
  body?: T | null;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
};

type request = (args: RequestArgs<BodyConstraint>) => Promise<Response | null>;

type withJson = <T extends BodyConstraint>(
  args: RequestArgs<T>
) => Promise<T | null>;
```

#### Usage

```tsx
type User = {
  id: 1;
  ...
};

function SomeComponent() {
  const { isLoading, error, request, withJson } = useHttp();

  // get Response object
  useEffect(() => {
    (async () => {
      const res = await request({
        url: "https://some-url.com/api/user/1",
      });
      if (res) {
        // do something ...
      }
    })();
  }, [request]);

  // or get JSON directly
  useEffect(() => {
    (async () => {
      const data = await withJson<User>({
        url: "https://some-url.com/api/user/1",
      });
      if (data) {
        // do something ...
      }
    })();
  }, [withJson]);

  return (
    <>
      {isLoading && <Spinner />}
      {error && <Error msg={error.message} />}
      ...
    </>
  )

}
```
