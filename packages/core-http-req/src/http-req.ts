import Cache from '@lindeneg/cache';
import LS from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { EmptyObj, SafeOmit } from '@lindeneg/types';
import { CacheStrategy, ListenerAction, ReqMethod } from './constants';
import type {
  RequestConfig,
  HttpReqConstructor,
  PromiseRequestResult,
  PartialRequestConfig,
  RequestResult,
  CustomError,
} from './types';

export default class HttpReq {
  private readonly cache: Cache<EmptyObj> | null;
  private readonly baseUrl: string;
  private readonly sharedOptions: RequestConfig | null;
  private readonly activeRequests: AbortController[];
  private readonly shouldSetListeners: boolean;

  constructor(config?: HttpReqConstructor) {
    const {
      cacheConfig = { strategy: CacheStrategy.Memory },
      shouldSetListeners = true,
      baseUrl = '',
      sharedOptions,
    } = config || {};
    const { strategy, ..._config } = cacheConfig;
    this.baseUrl = baseUrl;
    this.cache = this.getCacheFromStrategy(strategy, _config);
    this.sharedOptions = sharedOptions || null;
    this.activeRequests = [];
    this.shouldSetListeners = shouldSetListeners;
    this.handleListener(ListenerAction.ADD);
  }

  public request = async <E extends CustomError = CustomError>(
    url: string,
    options?: RequestConfig
  ): Promise<RequestResult<Response, E>> => {
    const result: Partial<RequestResult<Response, E>> = {};
    const abortController = new AbortController();
    this.activeRequests.push(abortController);
    try {
      this.fetchOrThrow();
      const response = await window.fetch(this.fullUrl(url), {
        ...this.getOptions(options),
        signal: abortController.signal,
      });
      result.statusCode = response.status;
      if (!response.ok) {
        result.error = <E>await response.json();
      }
      result.data = response;
    } catch (err) {
      result.error = <E>err;
    }
    return <RequestResult<Response, E>>result;
  };

  public getJson = async <
    T extends EmptyObj,
    E extends CustomError = CustomError
  >(
    url: string,
    options?: PartialRequestConfig
  ): PromiseRequestResult<T, E> => {
    const fullUrl = this.fullUrl(url);
    const cached = this.cache ? <T | null>this.cache.value(fullUrl) : null;
    if (cached) {
      return { data: cached, fromCache: true };
    }
    const req = await this.request<E>(url, {
      ...this.getOptionsWithJson(options),
      method: ReqMethod.GET,
    });
    const result = await this.handleJsonResponse<T, E>(req);
    result.data && this.cache && this.cache.set(fullUrl, result.data);
    return { ...result, fromCache: false };
  };

  public sendJson = async <
    T extends EmptyObj,
    E extends CustomError = CustomError
  >(
    url: string,
    body: EmptyObj,
    method: ReqMethod.POST | ReqMethod.PUT | ReqMethod.PATCH = ReqMethod.POST,
    options?: PartialRequestConfig
  ): PromiseRequestResult<T, E> => {
    const req = await this.request<E>(url, {
      ...this.getOptionsWithJson(options),
      method,
      body: JSON.stringify(body),
    });
    return await this.handleJsonResponse<T, E>(req);
  };

  public deleteJson = async <
    T extends EmptyObj,
    E extends CustomError = CustomError
  >(
    url: string,
    body?: EmptyObj,
    options?: PartialRequestConfig
  ): PromiseRequestResult<T, E> => {
    const req = await this.request<E>(url, {
      ...this.getOptionsWithJson(options),
      method: ReqMethod.DELETE,
      body: JSON.stringify(body || {}),
    });
    return await this.handleJsonResponse<T, E>(req);
  };

  public destroy = (): void => {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.handleListener(ListenerAction.REMOVE);
    this.cache && this.cache.destruct();
  };

  private handleJsonResponse = async <
    T extends EmptyObj,
    E extends CustomError
  >(
    req: RequestResult<Response, E>
  ): Promise<RequestResult<T, E>> => {
    const result: RequestResult<T, E> = { statusCode: req.statusCode };
    if (req.error) {
      return { error: req.error, statusCode: req.statusCode };
    }
    try {
      const json = <T>await req.data?.json();
      result.data = json;
    } catch (err) {
      result.error = <E>err;
    }
    return result;
  };

  private getCacheFromStrategy = (
    strategy: CacheStrategy,
    config: SafeOmit<Config<EmptyObj>, 'delayInit' | 'prefix'>
  ): Cache<EmptyObj> | null => {
    if (strategy === CacheStrategy.Memory) {
      return new Cache<EmptyObj>(config);
    } else if (strategy === CacheStrategy.LocalStorage) {
      return new LS<EmptyObj>(config);
    }
    return null;
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
    if (typeof window.fetch === 'undefined') {
      throw new Error("'fetch' is not available in current environment");
    }
  };

  private fullUrl = (url: string): string => {
    return this.baseUrl + url;
  };

  private handleListener = (type: ListenerAction): void => {
    if (this.shouldSetListeners && typeof window !== 'undefined') {
      if (type === ListenerAction.ADD) {
        window.addEventListener('unload', this.destroy);
      } else if (type === ListenerAction.REMOVE) {
        window.removeEventListener('unload', this.destroy);
      }
    }
  };
}
