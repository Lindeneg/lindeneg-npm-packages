import { act, renderHook } from "@testing-library/react-hooks";
import useBrowserCache from "../useBrowserCache";
import { TestObj, getMock, mockSize } from "./cache-mock";

type MockData = ReturnType<typeof getMock>;
type MockKey = keyof MockData;

function setLS(data: MockData) {
  Object.keys(data).forEach((key) => {
    const entry = data[key as MockKey];
    window.localStorage.setItem(`__clch__${key}`, JSON.stringify(entry));
  });
}

function getLS(key: MockKey) {
  const item = window.localStorage.getItem(`__clch__${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS() {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`__clch__${key}`);
  });
}

describe("Test Suite: useBrowserCache", () => {
  afterEach(() => {
    clearLS();
  });
  test("can initialize cache without initial LS data", () => {
    const { result } = renderHook(() => useBrowserCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);
  });
  test("can initialize cache with initial LS data", () => {
    const data = getMock();
    setLS(data);

    const { result } = renderHook(() => useBrowserCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());
    expect(cache().value("id")).toBe(data.id?.value);
    expect(cache().get("id")?.value).toBe(data.id?.value);
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });
  });
  test("can set cache item", () => {
    const { result } = renderHook(() => useBrowserCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(0);
    expect(cache().get("id")).toBe(null);
    expect(getLS("id")).toBe(null);

    act(() => {
      cache().set("id", 5);
    });

    expect(cache().size()).toBe(1);
    expect(cache().get("id")?.value).toBe(5);
    expect(getLS("id")?.value).toBe(5);
  });

  test("can remove cache item", () => {
    const data = getMock();
    setLS(data);

    const { result } = renderHook(() => useBrowserCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });

    act(() => {
      cache().remove("id");
    });

    expect(cache().size()).toBe(mockSize() - 1);
    expect(cache().value("id")).toBe(null);
    expect(getLS("id")).toBe(null);
  });
  test("can clear cache items", () => {
    const data = getMock();
    setLS(data);

    const { result } = renderHook(() => useBrowserCache<TestObj>());

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });

    act(() => {
      cache().clear();
    });

    expect(cache().size()).toBe(0);
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toBe(null);
    });
  });

  test("can trim cache items", (done) => {
    const data = getMock(0.1);
    setLS(data);

    const { result } = renderHook(() =>
      useBrowserCache<TestObj>({ trim: 0.2 })
    );

    const { cache } = result.current;

    expect(cache().size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });

    setTimeout(() => {
      expect(cache().size()).toBe(0);
      Object.keys(data).forEach((key) => {
        expect(getLS(key as MockKey)).toBe(null);
      });
      done();
    }, 300);
  });
});
