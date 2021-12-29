import Cache, { CacheData } from "../cache";

export type TestObj = {
  id: number;
  options: string[];
  favorites: {
    albums: string[];
  };
};

export function getMock(tll?: number): CacheData<TestObj> {
  return {
    id: Cache.createEntry(42, tll),
    options: Cache.createEntry(["miles", "davis"], tll),
    favorites: Cache.createEntry(
      {
        albums: ["kind of blue", "sketches of spain"],
      },
      tll
    ),
  };
}

export function mockSize() {
  return Object.keys(getMock()).length;
}
