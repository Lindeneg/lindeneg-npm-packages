import fetch, { enableFetchMocks } from "jest-fetch-mock";
import { act, renderHook } from "@testing-library/react-hooks";
import useHttp from "../useHttp";

enableFetchMocks();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = any;

const MOCK_URL = "http://mock-that-does-not-exist.not.valid.domain";

describe("Test Suite: useHttp", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  test("returns Response object on 200", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "success" }), {
      status: 200,
    });

    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.request({ url: MOCK_URL });
    });

    expect(res instanceof Response).toBe(true);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "success" });
    expect(result.current.error).toBe(null);
  });
  test("returns Response object on 404 and sets error", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "not found" }), {
      status: 404,
    });

    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.request({ url: MOCK_URL });
    });

    expect(res instanceof Response).toBe(true);
    expect(res.status).toBe(404);
    expect(result.current.error).toEqual({ message: "not found" });
  });
  test("error can be cleared using clearError function", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "not found" }), {
      status: 404,
    });

    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.request({ url: MOCK_URL });
    });

    expect(res instanceof Response).toBe(true);
    expect(res.status).toBe(404);
    expect(result.current.error).toEqual({ message: "not found" });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
  test("returns object withJson on 200", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: "success" }), {
      status: 200,
    });

    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.withJson({ url: MOCK_URL });
    });

    expect(res).toEqual({ message: "success" });
    expect(result.current.error).toBe(null);
  });
  test("returns error on invalid json response", async () => {
    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.withJson({ url: MOCK_URL });
    });

    expect(res).toBe(null);
    expect(result.current.error).toEqual({
      message:
        "invalid json response body at  reason: Unexpected end of JSON input",
    });
  });
  test("returns object on 200 POST request", async () => {
    fetch.mockResponseOnce(JSON.stringify({ hello: "there" }), {
      status: 200,
    });

    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.withJson<{ message: string }>({
        url: MOCK_URL,
        body: { hello: "there" },
        method: "POST",
      });
    });

    expect(res).toEqual({ hello: "there" });
    expect(result.current.error).toBe(null);
  });
  test("returns error on GET request with body", async () => {
    const { result } = renderHook(() => useHttp());

    let res: R = null;

    await act(async () => {
      res = await result.current.withJson({
        url: MOCK_URL,
        body: { hello: "there" },
      });
    });

    expect(res).toBe(null);
    expect(result.current.error).toEqual({
      message: "Request with GET/HEAD method cannot have body",
    });
  });
});
