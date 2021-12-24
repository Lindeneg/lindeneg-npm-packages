import { useState, useCallback, useEffect, useRef } from "react";
import { EmptyObj } from "../shared";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestArgs = {
  url: string;
  body?: EmptyObj | null;
  method?: HttpMethod;
  headers?: HeadersInit;
};

function getArgs({ body, ...args }: Omit<RequestArgs, "url">) {
  let sb: string | null = null;
  if (body !== null) {
    sb = typeof body === "string" ? body : JSON.stringify(body);
  }
  return sb ? { ...args, body: sb } : { ...args };
}

function useHttp<Err extends { message?: string }>() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Err | null>(null);
  const activeRequests = useRef<AbortController[]>([]);

  const request = useCallback(async function ({
    url,
    body = null,
    method = "GET",
    headers = {},
  }: RequestArgs): Promise<Response | null> {
    setIsLoading(true);
    const args = getArgs({ body, method, headers });
    const abortController: AbortController = new AbortController();
    activeRequests.current.push(abortController);
    let result: Response | null = null;
    try {
      result = await fetch(url, {
        ...args,
        signal: abortController.signal,
      });
      activeRequests.current = activeRequests.current.filter(
        (e) => e !== abortController
      );
      if (!result.ok) {
        setError(await result.json());
      }
    } catch (err) {
      setError({ message: (err as Error).message } as Err);
    }
    setIsLoading(false);
    return result;
  },
  []);

  const withJson = useCallback(
    async function <T extends EmptyObj>({
      headers = {},
      ...args
    }: RequestArgs): Promise<T | null> {
      const res = await request({
        ...args,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      let data: T | null = null;
      if (res) {
        try {
          data = await res.json();
        } catch (err) {
          setError((prev) => {
            const e = (err as Error).message;
            const msg = prev?.message || "";
            return { message: msg ? `${msg}|${e}` : e } as Err;
          });
        }
      }
      return data;
    },
    [request]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      activeRequests.current.forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  return { isLoading, error, clearError, request, withJson };
}

export default useHttp;
