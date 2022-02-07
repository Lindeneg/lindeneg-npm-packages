### @lindeneg/core-http-req

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/core-http-req) ![license](https://badgen.net/npm/license/@lindeneg/core-http-req)

---

A [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper for easy use with `JSON` requests/responses.

### Installation

`yarn add @lindeneg/core-http-req`

### Usage

```ts
import HttpReq from '@lindeneg/core-http-req';

type User = {
  id: number;
  username: string;
  email: string;
};

type ExpectedError = {
  code: number;
  message: string;
};

const httpReq = new HttpReq(config);

const {
  data, // has type: User | undefined
  error, // has type: ExpectedError | undefined
  statusCode,
} = await httpReq.getJson<User, ExpectedError>('/user/1', options);
```

#### Config

An object of type:

| Name               | Required | Type                                                       | Default                                                  | Description                                                                                                                                                                         |
| ------------------ | -------- | ---------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| baseUrl            | N        | `string`                                                   | `''`                                                     | url to be used for all requests. url given to specific requests, is simply appended.                                                                                                |
| sharedOptions      | N        | `RequestInit                                               | `undefined`                                              | shared request config to be used for all requests. if the request itself is called with a request config, the two configs are merged with the shared config yielding to overwrites. |
| cacheConfig        | N        | `{strategy: CacheStrategy; ttl?: number; trim?: number; }` | `{ttl: 3600, trim: 600, strategy: CacheStrategy.Memory}` | cache config to be used for caching get requests                                                                                                                                    |
| shouldSetListeners | N        | `boolean`                                                  | `true`                                                   | if true, will set listeners to abort active requests on `unload` event                                                                                                              |

#### Methods

All methods returns a `Promise` that resolves to an object of type `RequestResult`.

```ts
type CustomError = Partial<Error>;

type RequestResult<T, E extends CustomError> = {
  data?: T; // data type expected
  error?: E; // error type expected
  fromCache?: boolean; // data served from cache?
  statusCode?: number; // response.status number
};
```

The type of properties `data` and `error` can be specified on a per request basis but it should be noted that a non-ok response, if any body is included, is expected to be json.

##### request

This is the base for all requests and is called by all below methods. It returns a standard `Response` object.

```ts
function request<E extends CustomError>(
  url: string,
  options?: RequestInit
) => Promise<RequestResult<Response, E>>

```

##### getJson

`GET` JSON. If a `CacheStrategy` is defined, response data will be cached and served when appropriate. Properties `body` and `method` are omitted from the optional `options` object.

```ts
function getJson<T extends EmptyObj, E extends CustomError>(
  url: string,
  options?: RequestInit // properties 'body' and 'method' omitted
) => Promise<RequestResult<T, E>>
```

##### sendJson

`POST/PATCH/PUT` JSON.

```ts
function sendJson<T extends EmptyObj, E extends CustomError>(
  url: string,
  body: EmptyObj,
  method: ReqMethod.POST | ReqMethod.PUT | ReqMethod.PATCH = ReqMethod.POST,
  options?: PartialRequestConfig // contains json Content-Type in headers by default
) => Promise<RequestResult<T, E>>
```

##### deleteJson

`DELETE` JSON.

```ts
function deleteJson<T extends EmptyObj, E extends CustomError>(
  url: string,
  body?: EmptyObj,
  options?: RequestInit // property 'method' omitted
) => Promise<RequestResult<T, E>>
```

##### Destroy

Remove unload event listener, remove cache trim listener and abort all active requests.

```ts
httpReq.destroy();
```
