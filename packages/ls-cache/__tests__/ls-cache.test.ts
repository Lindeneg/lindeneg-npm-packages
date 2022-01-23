import Cache from '@lindeneg/cache';
import type { CacheData } from '@lindeneg/cache';
import LS from '../src';

const PREFIX = '`__clch__';

LS.setPrefix(PREFIX);

type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

function getMock(tll?: number): CacheData<TestObj> {
  return {
    id: Cache.createEntry(42, tll),
    options: Cache.createEntry(['miles', 'davis'], tll),
    favorites: Cache.createEntry(
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

function getLS(key: MockKey) {
  const item = window.localStorage.getItem(`${PREFIX}${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS() {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  });
}

describe('Test Suite: @lindeneg/ls-cache', () => {
  afterEach(() => {
    clearLS();
  });
  test('can set item', () => {
    const entry = Cache.createEntry(1);
    LS.set('id', entry);
    expect(getLS('id')).toEqual(entry);
  });
  test('can get item', () => {
    const entry = Cache.createEntry(1);
    LS.set('id', entry);
    expect(LS.get('id')).toEqual(entry);
  });
  test('can remove item', () => {
    const entry = Cache.createEntry(1);
    LS.set('id', entry);
    expect(getLS('id')).toEqual(entry);
    LS.remove('id');
    expect(getLS('id')).toEqual(null);
  });
  test('can get all items', () => {
    const data = getMock();
    setLS(data);
    expect(LS.getAll()).toEqual(data);
  });
  test('can destroy all items', () => {
    const data = getMock();
    setLS(data);
    LS.destroy();
    expect(LS.getAll()).toEqual({});
  });
  test('can trim items', (done) => {
    const data = getMock(0.1);
    const { favorites, options } = data;
    setLS(data);

    setTimeout(() => {
      LS.trim(['id']);
      expect(LS.getAll()).toEqual({ favorites, options });
      done();
    }, 300);
  });
});
