import Cache from '../src';
import type { CacheData } from '../src';

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

function mockSize() {
  return Object.keys(getMock()).length;
}

describe('Test Suite: @lindeneg/cache', () => {
  test('can initialize without initial data', () => {
    const cache = new Cache();
    expect(cache.size()).toBe(0);
  });
  test('can initialize with initial data', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.size()).toBe(mockSize());
    expect(cache.value('id')).toBe(data.id?.value);
    expect(cache.get('id')?.value).toBe(data.id?.value);
    expect(Math.round(Number(cache.get('id')?.expires))).toEqual(
      Math.round(Number(data.id?.expires))
    );
  });
  test('can set item', () => {
    const cache = new Cache();

    cache.set('id', 5);

    expect(cache.size()).toBe(1);
    expect(cache.value('id')).toBe(5);
    expect(cache.get('id')?.value).toBe(5);
  });
  test('can remove item', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.size()).toBe(mockSize());

    cache.remove('id');
    expect(cache.size()).toBe(mockSize() - 1);
    expect(cache.value('id')).toBe(null);
  });
  test('can check item', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.has('id')).toBe(true);
    //@ts-expect-error unknown key test
    expect(cache.has('not-id')).toBe(false);
  });
  test('can clear items', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.size()).toBe(mockSize());

    cache.clear();

    expect(cache.size()).toBe(0);
  });
  test('can trim items', (done) => {
    const data = getMock(0.1);
    const cache = new Cache({ data, trim: 0.2 });

    expect(cache.size()).toBe(mockSize());

    setTimeout(() => {
      expect(cache.size()).toBe(0);
      done();
    }, 300);
  });

  test('can listen to set events', () => {
    const cache = new Cache();
    const fn = jest.fn((key, value) => {
      expect(key).toBe('id');
      expect(value).toBe(45);
    });

    cache.on('set', fn);
    cache.set('id', 45);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.value('id')).toBe(45);
  });
  test('can listen to remove events', () => {
    const data = getMock();
    const cache = new Cache({ data });

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
    const cache = new Cache({ data });

    const fn = jest.fn();

    cache.on('clear', fn);
    cache.clear();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.size()).toBe(0);
  });
  test('can listen to trim events', (done) => {
    const data = getMock(0.1);
    const cache = new Cache({ data, trim: 0.2 });

    const fn = jest.fn((removed: Array<unknown>) => {
      expect(removed.length).toBe(mockSize());
    });

    cache.on('trim', fn);

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(cache.size()).toBe(0);
      done();
    }, 300);
  });
  test('can listen to destruct event', () => {
    const cache = new Cache();

    const fn = jest.fn();

    cache.on('destruct', fn);
    cache.destruct();

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('can set multiple listeners on same event', () => {
    const cache = new Cache();

    const setFn1 = jest.fn();
    const setFn2 = jest.fn();

    cache.on('set', setFn1);
    cache.on('set', setFn2);
    cache.set('id', 42);

    expect(setFn1).toHaveBeenCalledTimes(1);
    expect(setFn2).toHaveBeenCalledTimes(1);
  });
});
