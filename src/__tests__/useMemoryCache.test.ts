import { act, renderHook } from "@testing-library/react-hooks";
import { useMemoryCache } from "../useCache";
import { getTime } from "../useCache/cache";

type TestObj = {
  id: number;
};

describe("Test Suite: useMemoryCache", () => {
  test("can initialize cache without initial data", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);
  });
  test("can initialize cache with initial data", () => {
    const { result } = renderHook(() =>
      useMemoryCache<TestObj>({ initial: { id: 42 } })
    );

    const obj = { expires: getTime() + 3600, value: 42 };

    const { cache } = result.current;

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(42);
    expect(cache().get("id")?.value).toBe(42);
    expect(Math.round(cache().get("id")?.expires || 0)).toEqual(
      Math.round(obj.expires)
    );
  });
  test("can set cache item", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(5);
    expect(cache().get("id")?.value).toBe(5);
  });
  // TODO
  test("can remove cache item", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(5);
    expect(cache().get("id")?.value).toBe(5);
  });
  test("can check cache item", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(5);
    expect(cache().get("id")?.value).toBe(5);
  });
  test("can clear cache items", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(5);
    expect(cache().get("id")?.value).toBe(5);
  });
  test("can trim cache items", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().value("id")).toBe(5);
    expect(cache().get("id")?.value).toBe(5);
  });

  test("can listen to set events", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;
  });
  test("can listen to remove events", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;
  });
  test("can listen to clear events", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;
  });
  test("can listen to trim events", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;
  });
  test("can listen to destruct event", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;
  });
});
