import Cache from '@lindeneg/cache';
import type { CacheConfig } from '@lindeneg/cache';
import type { SafeOmit, EmptyObj } from '@lindeneg/types';

type RequestResult<T> = {
  data?: T;
  error?: Error;
};

type PromiseRequestResult<T> = Promise<RequestResult<T>>;

type FetchRequestConstructor = {
  sharedOptions?: RequestInit;
  cacheConfig?: SafeOmit<CacheConfig<EmptyObj>, 'data'>;
  shouldSetListeners?: boolean;
};

class FetchRequest {
  private readonly cache: Cache<EmptyObj>;
  private readonly sharedOptions: RequestInit | null;
  private readonly activeRequests: AbortController[];
  private readonly shouldSetListeners: boolean;

  constructor({
    sharedOptions,
    cacheConfig,
    shouldSetListeners = true,
  }: FetchRequestConstructor) {
    this.cache = new Cache(cacheConfig);
    this.sharedOptions = sharedOptions || null;
    this.activeRequests = [];
    this.shouldSetListeners = shouldSetListeners;
    this.handleListener('add');
  }

  public getJson = async <T>(
    url: string,
    options?: RequestInit
  ): PromiseRequestResult<T> => {
    const result: RequestResult<T> = {};
    const req = await this.request(url, this.getOptionsWithJson(options));
    if (result.error) {
      return { error: result.error };
    }
    try {
      const json = (await req.data?.json()) as T;
      result.data = json;
    } catch (err) {
      result.error = err as Error;
    }
    return result;
  };

  public postJson = <T>(): PromiseRequestResult<T> => {
    //
  };

  public patchJson = <T>(): PromiseRequestResult<T> => {
    //
  };

  public deleteJson = <T>(): PromiseRequestResult<T> => {
    //
  };

  public putJson = <T>(): PromiseRequestResult<T> => {
    //
  };

  public request = async (
    url: string,
    options?: RequestInit
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
    return result;
  };

  private getOptions = (options?: RequestInit): RequestInit => {
    return {
      ...this.sharedOptions,
      ...options,
    };
  };

  private getOptionsWithJson = (options?: RequestInit): RequestInit => {
    return {
      ...this.sharedOptions,
      ...options,
      headers: {
        ...(this.sharedOptions?.headers || {}),
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
