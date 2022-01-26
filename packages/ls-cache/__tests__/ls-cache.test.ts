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
  test('initializes with no arguments', () => {
    const ls = newLS();
    expect(ls.size()).toBe(0);
  });
  test('respects delay in initialization of cache', async () => {
    const data = getMock();
    setLS(data);
    const ls = newLS({ delayInitialize: true });
    expect(ls.size()).toBe(0);
    expect(Object.keys(window.localStorage).length).toBe(3);
  });
  test('initializes with specified prefix', () => {
    const ls = newLS({ delayInitialize: true, prefix: PREFIX2 });
    ls.set('id', 1);
    expect(getLS('id', PREFIX2).value).toBe(1);
    expect(getLS('id', PREFIX)).toBe(null);
  });
  test('can initialize with cache after delay', async () => {
    const data = getMock();
    setLS(data);
    const ls = newLS({ delayInitialize: true });
    await ls.initialize();
    Object.keys(data).forEach((key) => {
      const entry = data[<MockKey>key];
      expect(ls.get(<MockKey>key)).toEqual(entry);
      expect(getLS(<MockKey>key)).toEqual(entry);
    });
  });
  test('can set item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(getLS('id').value).toEqual(1);
  });
  test('can set item using async', async () => {
    const ls = newLS();
    await ls.setAsync('id', 1);
    expect(getLS('id').value).toEqual(1);
  });
  test('can get item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.get('id')?.value).toEqual(1);
  });
  test('returns null on get invalid item', () => {
    const ls = newLS();
    expect(ls.get('id')).toEqual(null);
  });
  test('rejects promise on getAsync with invalid item', () => {
    const ls = newLS();
    expect(ls.getAsync('id')).rejects.toMatch("key 'id' could not be found");
  });
  test('can get item using async', async () => {
    const ls = newLS();
    await ls.setAsync('id', 1);
    expect((await ls.getAsync('id')).value).toEqual(1);
  });
  test('can get value', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.value('id')).toEqual(1);
  });
  test('can get value using async', async () => {
    const ls = newLS();
    await ls.setAsync('id', 1);
    expect(await ls.valueAsync('id')).toEqual(1);
  });
  test('can remove item', () => {
    const ls = newLS();
    ls.set('id', 1);
    expect(ls.get('id')?.value).toBe(1);
    ls.remove('id');
    expect(ls.get('id')).toBe(null);
  });
  test('can remove item using async', async () => {
    const ls = newLS();
    await ls.setAsync('id', 1);
    expect(await ls.valueAsync('id')).toEqual(1);
  });
  test('can clear items', async () => {
    const data = getMock();
    setLS(data);
    const ls = newLS({ delayInitialize: true });
    await ls.initialize();
    expect(ls.size()).toBeGreaterThan(0);
    expect(ls.size()).toBe(Object.keys(window.localStorage).length);
    ls.clear();
    expect(ls.size()).toBe(0);
    expect(ls.size()).toBe(Object.keys(window.localStorage).length);
  });
  test('can trim items', async () => {
    const data = getMock(0.1);
    setLS(data);
    const ls = newLS({ trim: 0.2, delayInitialize: false });
    await ls.initialize();
    expect(ls.size()).toBeGreaterThan(0);
    expect(ls.size()).toBe(Object.keys(data).length);
    setTimeout(() => {
      expect(ls.size()).toBe(0);
    }, 300);
  });
});
