import type { CacheData } from '@lindeneg/cache';
import LS, { Config } from '../src';

const PREFIX = '__cl_ls_cache__';
const PREFIX2 = '__sometestprefix__';

type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

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

type MockData = ReturnType<typeof getMock>;
type MockKey = keyof MockData;

function setLS(data: MockData) {
  Object.keys(data).forEach((key) => {
    const entry = data[key as MockKey];
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  });
}

function getLS(key: MockKey, prefix = PREFIX) {
  const item = window.localStorage.getItem(`${prefix}${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS(prefix: string) {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`${prefix}${key}`);
  });
}

function newLS(config?: Partial<Config<TestObj>>): LS<TestObj> {
  return new LS(config);
}

describe('Test Suite: @lindeneg/ls-cache', () => {
  afterEach(() => {
    clearLS(PREFIX);
    clearLS(PREFIX2);
  });
  test('asynchronously initializes cache with empty localStorage', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    expect(ls.size()).toBe(0);
  });
  test('synchronously initializes cache with empty localStorage', () => {
    const ls = newLS();
    expect(ls.size()).toBe(0);
  });
  test('asynchronously initializes cache with non-empty localStorage', async () => {
    const data = getMock();
    setLS(data);
    const ls = await newLS({ delayInit: true }).initialize();
    expect(ls.size()).toBe(3);
    expect(Object.keys(window.localStorage).length).toBe(3);
    Object.keys(data).forEach((key) => {
      const entry = data[<MockKey>key];
      expect(ls.get(<MockKey>key)).toEqual(entry);
      expect(getLS(<MockKey>key)).toEqual(entry);
    });
  });
  test('synchronously initializes cache with non-empty localStorage', () => {
    const data = getMock();
    setLS(data);
    const ls = newLS();
    expect(ls.size()).toBe(3);
    expect(Object.keys(window.localStorage).length).toBe(3);
    Object.keys(data).forEach((key) => {
      const entry = data[<MockKey>key];
      expect(ls.get(<MockKey>key)).toEqual(entry);
      expect(getLS(<MockKey>key)).toEqual(entry);
    });
  });
  test('asynchronously initializes with specified prefix', async () => {
    const ls = await newLS({ prefix: PREFIX2, delayInit: true }).initialize();
    ls.set('id', 1);
    expect(getLS('id', PREFIX2).value).toBe(1);
    expect(getLS('id', PREFIX)).toBe(null);
  });
  test('synchronously initializes with specified prefix', () => {
    const ls = newLS({ prefix: PREFIX2 });
    ls.set('id', 1);
    expect(getLS('id', PREFIX2).value).toBe(1);
    expect(getLS('id', PREFIX)).toBe(null);
  });
  test('asynchronously sets item', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    await ls.setAsync('id', 1);
    expect(getLS('id').value).toEqual(1);
  });
  test('synchronously sets item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(getLS('id').value).toEqual(1);
  });
  test('asynchronously gets item', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    ls.set('id', 1);
    expect((await ls.getAsync('id'))?.value).toEqual(1);
  });
  test('synchronously gets item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.get('id')?.value).toEqual(1);
  });
  test('asynchronously rejects promise on invalid get', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    expect(ls.getAsync('id')).rejects.toMatch("key 'id' could not be found");
  });
  test('synchronously gets value', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.value('id')).toEqual(1);
  });
  test('asynchronously gets value', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    await ls.setAsync('id', 1);
    expect(await ls.valueAsync('id')).toEqual(1);
  });
  test('synchronously removes item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.get('id')?.value).toBe(1);
    ls.remove('id');
    expect(ls.get('id')).toBe(null);
    expect(getLS('id')).toBe(null);
  });
  test('asynchronously removes item', async () => {
    const ls = await newLS({ delayInit: true }).initialize();
    await ls.setAsync('id', 1);
    expect(await ls.valueAsync('id')).toEqual(1);
    expect(getLS('id').value).toBe(1);
    await ls.removeAsync('id');
    expect(ls.valueAsync('id')).rejects.toMatch("key 'id' could not be found");
    expect(getLS('id')).toBe(null);
  });
  test('can clear items', () => {
    const data = getMock();
    setLS(data);
    const ls = newLS();
    expect(ls.size()).toBeGreaterThan(0);
    expect(ls.size()).toBe(Object.keys(window.localStorage).length);
    ls.clear();
    expect(ls.size()).toBe(0);
    expect(ls.size()).toBe(Object.keys(window.localStorage).length);
  });
  test('can trim items', () => {
    const data = getMock(0.1);
    setLS(data);
    const ls = newLS({ trim: 0.2 });
    expect(ls.size()).toBeGreaterThan(0);
    expect(ls.size()).toBe(Object.keys(data).length);
    setTimeout(() => {
      expect(ls.size()).toBe(0);
    }, 300);
  });
  test('can listen to set events', () => {
    const cache = newLS();
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
    const cache = newLS();

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
    const cache = newLS();

    const fn = jest.fn();

    cache.on('clear', fn);
    cache.clear();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.size()).toBe(0);
  });
  test('can listen to trim events', (done) => {
    const data = getMock(0.1);
    setLS(data);
    const cache = newLS({ trim: 0.2 });

    const fn = jest.fn((removed: Array<unknown>) => {
      expect(removed.length).toBe(Object.keys(data).length);
    });

    cache.on('trim', fn);

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(cache.size()).toBe(0);
      done();
    }, 300);
  });
  test('can listen to destruct event', () => {
    const cache = newLS();

    const fn = jest.fn();

    cache.on('destruct', fn);
    cache.destruct();

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('can set multiple listeners on same event', () => {
    const cache = newLS();

    const setFn1 = jest.fn();
    const setFn2 = jest.fn();

    cache.on('set', setFn1);
    cache.on('set', setFn2);
    cache.set('id', 42);

    expect(setFn1).toHaveBeenCalledTimes(1);
    expect(setFn2).toHaveBeenCalledTimes(1);
  });
});
