import type { CacheConfig, CacheData } from '@lindeneg/cache';
import LS from '../src';

const PREFIX = '__clch__';

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

/*
function setLS(data: MockData) {
  Object.keys(data).forEach((key) => {
    const entry = data[key as MockKey];
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  });
}
*/

function getLS(key: MockKey) {
  const item = window.localStorage.getItem(`${PREFIX}${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS() {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  });
}

function newLS(config: Partial<CacheConfig<TestObj>> = {}) {
  return new LS('__clch__', config);
}

describe('Test Suite: @lindeneg/ls-cache', () => {
  afterEach(() => {
    clearLS();
  });
  test('can set item', () => {
    const ls = newLS();
    const entry = ls.createEntry(1);
    ls.set('id', entry);
    expect(getLS('id')).toEqual(entry);
  });
});
