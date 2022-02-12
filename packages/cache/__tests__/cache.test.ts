import Cache from '../src';
import type { CacheData, CacheEntry } from '../src';

type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

type ITestObj = {
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
    const cache = new Cache<TestObj>();
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
  test('can synchronously set entry', () => {
    const cache = new Cache<ITestObj>();

    expect(cache.set('id', 5).value).toBe(5);
    expect(cache.size()).toBe(1);
    expect(cache.value('id')).toBe(5);
    expect(cache.get('id')?.value).toBe(5);
  });
  test('can asynchronously set entry', async () => {
    const cache = new Cache();

    expect((await cache.setAsync('id', 5)).value).toBe(5);
    expect(cache.size()).toBe(1);
    expect(cache.value('id')).toBe(5);
    expect(cache.get('id')?.value).toBe(5);
  });
  test('can synchronously get entry with valid key', () => {
    const cache = new Cache();

    cache.set('id', 5);

    expect(cache.get('id')?.value).toBe(5);
  });
  test('can asynchronously get entry with valid key', async () => {
    const cache = new Cache();

    cache.set('id', 5);

    expect((await cache.getAsync('id'))?.value).toBe(5);
  });
  test('can synchronously get null with invalid key', () => {
    const cache = new Cache();

    expect(cache.get('id')).toBe(null);
  });
  test('can asynchronously return null on get with invalid key', () => {
    const cache = new Cache();

    expect(cache.getAsync('id')).resolves.toBe(null);
  });
  test('can synchronously get value with valid key', () => {
    const cache = new Cache();

    cache.set('id', 5);

    expect(cache.value('id')).toBe(5);
  });
  test('can asynchronously get value with valid key', () => {
    const cache = new Cache();

    cache.set('id', 5);

    expect(cache.valueAsync('id')).resolves.toBe(5);
  });
  test('can synchronously get null value with invalid key', () => {
    const cache = new Cache();
    expect(cache.value('id')).toBe(null);
  });
  test('can asynchronously return null on get value with invalid key', () => {
    const cache = new Cache();
    expect(cache.valueAsync('id')).resolves.toBe(null);
  });
  test('can remove expired key on get call', (done) => {
    const cache = new Cache({ ttl: 0.1 });
    cache.set('id', 5);
    setTimeout(() => {
      expect(cache.get('id')).toBe(null);
      done();
    }, 200);
  });
  test('can synchronously remove entry with valid key', () => {
    const cache = new Cache();

    const entry = cache.set('id', 5);

    expect(entry.value).toBe(5);
    expect(cache.size()).toBe(1);

    const removed = cache.remove('id');

    expect(removed).toEqual(entry);
    expect(cache.size()).toBe(0);
  });
  test('can asynchronously remove entry with valid key', async () => {
    const cache = new Cache();

    const entry = await cache.setAsync('id', 5);

    expect(entry.value).toBe(5);
    expect(cache.size()).toBe(1);

    const removed = await cache.removeAsync('id');

    expect(removed).toEqual(entry);
    expect(cache.size()).toBe(0);
  });
  test('can synchronously get null on remove entry with invalid key', () => {
    const cache = new Cache();

    const removed = cache.remove('id');

    expect(removed).toEqual(null);
  });
  test('can asynchronously return null on remove entry with invalid key', () => {
    const cache = new Cache();

    expect(cache.removeAsync('id')).resolves.toBe(null);
  });
  test('can synchronously clear cache', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.size()).toBe(mockSize());

    cache.clear();

    expect(cache.size()).toBe(0);
  });
  test('can asynchronously clear cache', async () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.size()).toBe(mockSize());

    await cache.clearAsync();

    expect(cache.size()).toBe(0);
  });
  test('can check entry status', () => {
    const data = getMock();
    const cache = new Cache({ data });

    expect(cache.has('id')).toBe(true);
    //@ts-expect-error unknown key test
    expect(cache.has('not-id')).toBe(false);
  });
  test('can trim entries', (done) => {
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
  test('can listen to clearTrimListener event', () => {
    const cache = new Cache();

    const fn = jest.fn();

    cache.on('clearTrimListener', fn);
    cache.clearTrimListener();

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
  test('can setEntry via protected method', () => {
    class ExtendedCache extends Cache<TestObj> {
      constructor(
        key: keyof TestObj,
        entry: CacheEntry<TestObj[keyof TestObj]>
      ) {
        super();
        this.setEntry(key, entry);
      }
    }
    const entry = Cache.createEntry(5);
    const cache = new ExtendedCache('id', entry);
    expect(cache.get('id')).toEqual(entry);
  });
});
