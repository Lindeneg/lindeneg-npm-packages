import Cache from '@lindeneg/cache';
import type { CacheConfig } from '@lindeneg/cache';
import type { SafeOmit, EmptyObj } from '@lindeneg/types';

type RequestResult<T> = {
  data?: T;
  error?: Error;
  fromCache?: boolean;
};

type PromiseRequestResult<T> = Promise<RequestResult<T>>;

type RequestConfig = {
  [K in keyof RequestInit]: RequestInit[K];
};

type RequestConfigWithoutMethodAndBody = SafeOmit<
  RequestConfig,
  'method' | 'body'
>;

type HttpReqConstructor = {
  sharedOptions?: RequestConfig;
  cacheConfig?: SafeOmit<CacheConfig<EmptyObj>, 'data'>;
  shouldSetListeners?: boolean;
};

export default class HttpReq {
  private readonly cache: Cache<EmptyObj>;
  private readonly sharedOptions: RequestConfig | null;
  private readonly activeRequests: AbortController[];
  private readonly shouldSetListeners: boolean;

  constructor(config?: HttpReqConstructor) {
    const {
      cacheConfig,
      sharedOptions,
      shouldSetListeners = true,
    } = config || {};
    this.cache = new Cache(cacheConfig);
    this.sharedOptions = sharedOptions || null;
    this.activeRequests = [];
    this.shouldSetListeners = shouldSetListeners;
    this.handleListener('add');
  }

  public getJson = async <T extends EmptyObj>(
    url: string,
    options?: RequestConfigWithoutMethodAndBody
  ): PromiseRequestResult<T> => {
    const cached = <T | null>this.cache.value(url);
    if (cached) {
      return { data: cached, fromCache: true };
    }
    const req = await this.request(url, {
      ...this.getOptionsWithJson(options),
      method: 'GET',
    });
    const json = await this.handleJsonResponse<T>(req);
    this.cache.set(url, json);
    return { ...json, fromCache: false };
  };

  public sendJson = async <T extends EmptyObj>(
    url: string,
    body: EmptyObj,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    options?: RequestConfigWithoutMethodAndBody
  ): PromiseRequestResult<T> => {
    const req = await this.request(url, {
      ...this.getOptionsWithJson(options),
      method,
      body: JSON.stringify(body),
    });
    const json = await this.handleJsonResponse<T>(req);
    return json;
  };

  public deleteJson = async <T extends EmptyObj>(
    url: string,
    body?: EmptyObj,
    options?: RequestConfigWithoutMethodAndBody
  ): PromiseRequestResult<T> => {
    const req = await this.request(url, {
      ...this.getOptionsWithJson(options),
      method: 'DELETE',
      body: JSON.stringify(body || {}),
    });
    const json = await this.handleJsonResponse<T>(req);
    return json;
  };

  public request = async (
    url: string,
    options?: RequestConfig
  ): Promise<RequestResult<Response>> => {
    const result: RequestResult<Response> = {};
    const abortController = new AbortController();
    this.activeRequests.push(abortController);
    try {
      this.fetchOrThrow();
      const response = await fetch(url, this.getOptions(options));
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      result.data = response;
    } catch (err) {
      result.error = <Error>err;
    }
    return { ...result, fromCache: false };
  };

  private handleJsonResponse = async <T extends EmptyObj>(
    req: RequestResult<Response>
  ): Promise<RequestResult<T>> => {
    const result: RequestResult<T> = {};
    if (req.error) {
      return { error: req.error };
    }
    try {
      const json = (await req.data?.json()) as T;
      result.data = json;
    } catch (err) {
      result.error = err as Error;
    }
    return result;
  };

  private getOptions = (options?: RequestConfig): RequestConfig => {
    return {
      ...this.sharedOptions,
      ...options,
    };
  };

  private getOptionsWithJson = (options?: RequestConfig): RequestConfig => {
    const merged = this.getOptions(options);
    return {
      ...merged,
      headers: {
        ...(merged.headers || {}),
        ...(options?.headers || {}),
        'Content-Type': 'application/json',
      },
    };
  };

  private fetchOrThrow = (): void => {
    if (typeof fetch === 'undefined') {
      throw new Error("'fetch' is not available in current environment");
    }
  };

  private handleListener = (type: 'add' | 'remove'): void => {
    if (this.shouldSetListeners && typeof window !== 'undefined') {
      if (type === 'add') {
        window.addEventListener('unload', this.cleanUp);
      } else {
        window.removeEventListener('unload', this.cleanUp);
      }
    }
  };

  private cleanUp = (): void => {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.handleListener('remove');
  };
}
