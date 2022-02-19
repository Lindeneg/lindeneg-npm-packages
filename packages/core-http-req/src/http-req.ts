import LS, { Cache } from '@lindeneg/ls-cache';
import type { Config } from '@lindeneg/ls-cache';
import type { RefConstraint, EmptyObj, SafeOmit } from '@lindeneg/types';
import type {
  RequestConfig,
  HttpReqConstructor,
  PromiseRequestResult,
  PartialRequestConfig,
  RequestResult,
  CustomError,
  AbortSignal,
  AbortControllerMap,
} from './types';
import { CacheStrategy, ListenerAction, ReqMethod } from './constants';

export default class HttpReq {
  private readonly cache: Cache<EmptyObj> | null;
  private readonly baseUrl: string;
  private readonly sharedOptions: RequestConfig | null;
  private readonly abortControllers: AbortControllerMap;
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
    this.abortControllers = new Map();
    this.shouldSetListeners = shouldSetListeners;
    this.handleListener(ListenerAction.ADD);
  }

  public request = async <E extends CustomError = CustomError>(
    url: string,
    options?: RequestConfig
  ): Promise<RequestResult<Response, E>> => {
    const result: Partial<RequestResult<Response, E>> = {};
    const signal = this.addAbortController();
    try {
      this.fetchOrThrow();
      const response = await window.fetch(this.fullUrl(url), {
        ...this.getOptions(options),
        signal: signal,
      });
      result.statusCode = response.status;
      if (!response.ok) {
        result.error = <E>await response.json();
      }
      result.data = response;
    } catch (err) {
      result.error = <E>err;
    }
    this.removeAbortController(signal);
    return <RequestResult<Response, E>>result;
  };

  public getJson = async <
    T extends RefConstraint<T> = EmptyObj,
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
    T extends RefConstraint<T> = EmptyObj,
    E extends CustomError = CustomError
  >(
    url: string,
    body: T,
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
    T extends RefConstraint<T> = EmptyObj,
    E extends CustomError = CustomError
  >(
    url: string,
    body?: T,
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
    this.abortControllers.forEach((abort) => {
      abort();
    });
    this.handleListener(ListenerAction.REMOVE);
    this.cache && this.cache.clearTrimListener();
  };

  private handleJsonResponse = async <
    T extends RefConstraint<T> = EmptyObj,
    E extends CustomError = CustomError
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

  private addAbortController = (): AbortSignal | null => {
    try {
      const controller = new window.AbortController();
      this.abortControllers.set(controller.signal, controller.abort);
      return controller.signal;
      // eslint-disable-next-line no-empty
    } catch (err) {}
    return null;
  };

  private removeAbortController = (signal: AbortSignal | null) => {
    if (signal) {
      this.abortControllers.delete(signal);
    }
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
    if (!window || typeof window !== 'object') {
      throw new Error("'window' is not available in current environment");
    } else if (!window.fetch || typeof window.fetch !== 'function') {
      throw new Error("'fetch' is not available in current environment");
    }
  };

  private fullUrl = (url: string): string => {
    return this.baseUrl + url;
  };

  private handleListener = (type: ListenerAction): void => {
    try {
      if (this.shouldSetListeners) {
        if (type === ListenerAction.ADD) {
          window.addEventListener('unload', this.destroy);
        } else if (type === ListenerAction.REMOVE) {
          window.removeEventListener('unload', this.destroy);
        }
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };
}
