import { act, renderHook } from '@testing-library/react-hooks';
import LS from '@lindeneg/ls-cache';
import type { CacheData } from '@lindeneg/ls-cache';
import useBrowserCache from '../src';

const PREFIX = '__clch__';

type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
}

interface ITestObj {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
}

function getMock(tll?: number): CacheData<TestObj> {
  return {
    id: LS.createEntry(42, tll),
    options: LS.createEntry(['miles', 'davis'], tll),
    favorites: LS.createEntry(
      {
        albums: ['kind of blue', 'sketches of spain'],
      },
      tll
    ),
  };
}

function mockSize() {
  return Object.keys(getMock()).length;
}

type MockData = ReturnType<typeof getMock>;
type MockKey = keyof MockData;

function setLS(data: MockData) {
  Object.keys(data).forEach((key) => {
    const entry = data[key as MockKey];
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  });
}

function getLS(key: MockKey) {
  const item = window.localStorage.getItem(`${PREFIX}${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS() {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  });
}

function c(config: Parameters<typeof useBrowserCache>[0] = {}) {
  return {
    prefix: PREFIX,
    ...config,
  };
}

describe('Test Suite: @lindeneg/browser-cache/cache', () => {
  beforeEach(() => {
    clearLS();
  });

  test('can initialize cache without initial LS data', () => {
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    expect(cache.size()).toBe(0);
  });

  test('can initialize cache with initial LS data', () => {
    const data = getMock();
    setLS(data);
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    expect(cache.size()).toBe(mockSize());
    expect(cache.value('id')).toBe(data.id?.value);
    expect(cache.get('id')?.value).toBe(data.id?.value);
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });
  });
  test('can set cache item', () => {
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    expect(cache.size()).toBe(0);
    expect(cache.get('id')).toBe(null);
    expect(getLS('id')).toBe(null);

    act(() => {
      cache.set('id', 5);
    });

    expect(cache.size()).toBe(1);
    expect(cache.get('id')?.value).toBe(5);
    expect(getLS('id')?.value).toBe(5);
  });

  test('can remove cache item', () => {
    const data = getMock();
    setLS(data);

    const { cache } = renderHook(() => useBrowserCache<ITestObj>(c())).result
      .current;

    expect(cache.size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });

    act(() => {
      cache.remove('id');
    });

    expect(cache.size()).toBe(mockSize() - 1);
    expect(cache.value('id')).toBe(null);
    expect(getLS('id')).toBe(null);
  });
  test('can clear cache items', () => {
    const data = getMock();
    setLS(data);

    const { cache } = renderHook(() => useBrowserCache<ITestObj>(c())).result
      .current;

    expect(cache.size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(data[key as MockKey]);
    });

    act(() => {
      cache.clear();
    });

    expect(cache.size()).toBe(0);
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toBe(null);
    });
  });

  test('can trim cache items', (done) => {
    const data = getMock(0.1);
    setLS(data);

    const { cache } = renderHook(() =>
      useBrowserCache<ITestObj>(c({ trim: 0.2 }))
    ).result.current;

    expect(cache.size()).toBe(mockSize());
    Object.keys(data).forEach((key) => {
      expect(getLS(key as MockKey)).toEqual(cache.get(key as MockKey));
    });

    setTimeout(() => {
      expect(cache.size()).toBe(0);
      Object.keys(data).forEach((key) => {
        expect(getLS(key as MockKey)).toBe(null);
      });
      done();
    }, 300);
  });
  test('can listen to set events', () => {
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    const fn = jest.fn((key, entry) => {
      expect(key).toBe('id');
      expect(entry.value).toBe(45);
    });

    cache.on('set', fn);
    cache.set('id', 45);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.value('id')).toBe(45);
  });
  test('can listen to remove events', () => {
    const data = getMock();
    setLS(data);
    const { cache } = renderHook(() => useBrowserCache<ITestObj>(c())).result
      .current;

    const fn = jest.fn((key) => {
      expect(key).toBe('id');
    });

    cache.on('remove', fn);
    cache.remove('id');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.value('id')).toBe(null);
  });

  test('can listen to clear events', () => {
    const data = getMock();
    setLS(data);
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    const fn = jest.fn();

    cache.on('clear', fn);
    cache.clear();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.size()).toBe(0);
  });
  test('can listen to trim events', (done) => {
    const data = getMock(0.1);
    setLS(data);
    const { cache } = renderHook(() =>
      useBrowserCache<TestObj>(c({ trim: 0.2 }))
    ).result.current;

    expect(cache.size()).toBe(mockSize());

    const fn = jest.fn((removed) => {
      expect(removed.length).toBe(mockSize());
    });

    cache.on('trim', fn);

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(cache.size()).toBe(0);
      done();
    }, 300);
  });
  test('can listen to clearTrimListener event', () => {
    const { cache } = renderHook(() => useBrowserCache<ITestObj>(c())).result
      .current;

    const fn = jest.fn();

    cache.on('clearTrimListener', fn);
    cache.clearTrimListener();

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('can set multiple listeners on same event', () => {
    const { cache } = renderHook(() => useBrowserCache<TestObj>(c())).result
      .current;

    const setFn1 = jest.fn();
    const setFn2 = jest.fn();

    cache.on('set', setFn1);
    cache.on('set', setFn2);
    cache.set('id', 42);

    expect(setFn1).toHaveBeenCalledTimes(1);
    expect(setFn2).toHaveBeenCalledTimes(1);
  });
});
