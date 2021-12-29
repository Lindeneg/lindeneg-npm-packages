import { act, renderHook } from "@testing-library/react-hooks";
import useMemoryCache from "../useMemoryCache";
import { TestObj, getMock, mockSize } from "./cache-mock";

describe("Test Suite: useMemoryCache", () => {
  test("can initialize cache without initial data", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);
  });
  test("can initialize cache with initial data", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());
    expect(cache().value("id")).toBe(data.id?.value);
    expect(cache().get("id")?.value).toBe(data.id?.value);
    expect(Math.round(Number(cache().get("id")?.expires))).toEqual(
      Math.round(Number(data.id?.expires))
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
  test("can remove cache item", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());

    act(() => {
      cache().remove("id");
    });

    expect(cache().size()).toBe(mockSize() - 1);
    expect(cache().value("id")).toBe(null);
  });
  test("can check cache item", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    expect(cache().has("id")).toBe(true);
    //@ts-expect-error unknown key test
    expect(cache().has("not-id")).toBe(false);
  });
  test("can clear cache items", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());

    act(() => {
      cache().clear();
    });

    expect(cache().size()).toBe(0);
  });
  test("can trim cache items", (done) => {
    const data = getMock(0.1);
    const { result } = renderHook(() =>
      useMemoryCache<TestObj>({ data, trim: 0.2 })
    );

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());

    setTimeout(() => {
      expect(cache().size()).toBe(0);
      done();
    }, 300);
  });

  test("can listen to set events", () => {
    const { result } = renderHook(() => useMemoryCache<TestObj>());

    const { cache } = result.current;

    const fn = jest.fn((key, value) => {
      expect(key).toBe("id");
      expect(value).toBe(45);
    });

    act(() => {
      cache().on("set", fn);
      cache().set("id", 45);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache().value("id")).toBe(45);
  });
  test("can listen to remove events", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    const fn = jest.fn((key) => {
      expect(key).toBe("id");
    });

    act(() => {
      cache().on("remove", fn);
      cache().remove("id");
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache().value("id")).toBe(null);
  });

  test("can listen to clear events", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    const fn = jest.fn((isDestruct) => {
      expect(isDestruct).toBe(false);
    });

    act(() => {
      cache().on("clear", fn);
      cache().clear();
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache().size()).toBe(0);
  });
  test("can listen to trim events", (done) => {
    const data = getMock(0.1);
    const { result } = renderHook(() =>
      useMemoryCache<TestObj>({ data, trim: 0.2 })
    );

    const { cache } = result.current;

    const fn = jest.fn((removed: Array<unknown>) => {
      expect(removed.length).toBe(mockSize());
    });

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(cache().size()).toBe(0);
      done();
    }, 300);

    act(() => {
      cache().on("trim", fn);
    });
  });
  test("can listen to destruct event", () => {
    const data = getMock();
    const { result } = renderHook(() => useMemoryCache<TestObj>({ data }));

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());

    const fn = jest.fn();

    act(() => {
      cache().on("destruct", fn);
      cache().destruct();
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache().size()).toBe(0);
  });
});
