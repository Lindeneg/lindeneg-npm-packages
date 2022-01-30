import Search from '../src/search';
import type { SearchPredicate, SearchOptions } from '../src/types';

function getUsers() {
  return [
    {
      id: 1,
      name: 'miles',
      email: 'miles@example.com',
      activity: [
        {
          events: [
            {
              context: 'scroll',
            },
          ],
        },
      ],
      interest: {
        name: 'trumpet',
        info: {
          special: 'solo',
        },
      },
      nested: {
        arr: [
          {
            name: 'kind of blue',
          },
          {
            name: 'sketches of spain',
          },
          {
            name: 'porgy and bess',
          },
        ],
      },
      strings: ['something1', 'something2', 'something7'],
    },
    {
      id: 2,
      name: 'davis',
      email: 'davis@example.com',
      activity: [
        {
          events: [
            {
              context: 'move',
            },
          ],
        },
      ],
      interest: {
        name: 'trumpet',
        info: {
          special: 'jam',
        },
      },
      nested: {
        arr: [
          {
            name: 'walkin',
          },
          {
            name: 'workin',
          },
          {
            name: 'relaxin',
          },
        ],
      },
      strings: ['something3', 'something4', 'something5', 'something 6'],
    },
    {
      id: 3,
      name: 'bill',
      activity: [
        {
          events: [
            {
              context: 'move',
            },
          ],
        },
      ],
      interest: {
        name: 'piano',
        info: {
          special: 'composing',
        },
      },
      nested: {
        arr: [
          {
            name: 'explorations',
          },
          {
            name: 'moonbeams',
          },
          {
            name: 'sunday at the village vanguard',
          },
        ],
      },
      strings: ['something7', 'something4', 'something5', 'something 6'],
    },
    {
      id: 4,
      name: 'evans',
      activity: [
        {
          events: [
            {
              context: 'composing',
            },
          ],
        },
      ],
      interest: {
        name: 'jazz',
        info: {
          special: 'listening',
        },
      },
      nested: {
        arr: [
          {
            name: 'waltz for debby',
          },
          {
            name: 'portrait of jazz',
          },
          {
            name: 'kind of blue',
          },
        ],
      },
      strings: ['something3', 'something4', 'something8', 'something 6'],
    },
  ];
}

type Users = Array<ReturnType<typeof getUsers>[number]>;

type S = (
  predicate: SearchPredicate<Users>,
  opts?: SearchOptions<Users>
) => Search<Users>;

function getSearch(
  users: Users,
  predicate: SearchPredicate<Users>,
  opts?: SearchOptions<Users>
) {
  return new Search<Users>(users, predicate, opts);
}

describe('Test Suite: @lindeneg/core-search', () => {
  let users: Users;
  let S: S;

  beforeEach(() => {
    users = getUsers();
    S = getSearch.bind(null, users);
  });

  test('returns unfiltered on empty query', () => {
    const search = S(['email']);

    expect(search.filter('')).toEqual(users);
  });
  test('returns filtered on single query', () => {
    const search = S(['email']);
    const filtered = search.filter('@example.com');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[0]);
    expect(filtered[1]).toEqual(users[1]);
  });
  test('resolves promise on filterAsync with single query', () => {
    const search = S(['email']);
    expect(search.filterAsync('@example.com')).resolves.toEqual([
      users[0],
      users[1],
    ]);
  });
  test('respect strict mode on non-alphabetic character', () => {
    const search = S(['email'], { mode: 'strict' });
    const filtered = search.filter('@example.com');

    expect(filtered.length).toEqual(0);
  });
  test('does not consider values in unspecified fields', () => {
    const search = S(['name']);
    const filtered = search.filter('@example.com');

    expect(filtered.length).toEqual(0);
  });
  test('allows to set predicate after initialization', () => {
    const search = S(['name']);
    const filtered = search.filter('@example.com');

    expect(filtered.length).toEqual(0);

    search.setPredicate(['email']);

    const filtered2 = search.filter('@example.com');

    expect(filtered2.length).toEqual(2);
    expect(filtered2[0]).toEqual(users[0]);
    expect(filtered2[1]).toEqual(users[1]);
  });
  test('returns filtered on single nested object query', () => {
    const search = S(['interest.name']);
    const filtered = search.filter('piano');

    expect(filtered.length).toEqual(1);
    expect(filtered[0]).toEqual(users[2]);
  });
  test('returns filtered on single nested array query', () => {
    const search = S(['activity.n.events.n.context']);
    const filtered = search.filter('move');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[1]);
    expect(filtered[1]).toEqual(users[2]);
  });
  test('returns filtered on multiple nested queries', () => {
    const search = S(['activity.n.events.n.context', 'interest.info.special']);
    const filtered = search.filter('composing');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[2]);
    expect(filtered[1]).toEqual(users[3]);
  });
  test('returns filtered on nested array of objects', () => {
    const search = S(['nested.arr.n.name']);
    const filtered = search.filter('kind of blue');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[0]);
    expect(filtered[1]).toEqual(users[3]);
  });
  test('returns filtered on nested array of strings', () => {
    const search = S(['strings.n']);
    const filtered = search.filter('something7');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[0]);
    expect(filtered[1]).toEqual(users[2]);
  });
  test('returns filtered and sorted on multiple nested queries', () => {
    const search = S(['activity.n.events.n.context', 'interest.info.special'], {
      sort: (a, b) => b.id - a.id,
    });
    const filtered = search.filter('composing');

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(users[3]);
    expect(filtered[1]).toEqual(users[2]);
  });
  test('escapes input in lenient sanitize mode', () => {
    const search = S(['activity.n.events.n.context', 'interest.info.special']);
    const filtered = search.filter('(');

    expect(filtered.length).toEqual(0);
  });
  test('ignores input in strict sanitize mode', () => {
    const search = S(['activity.n.events.n.context', 'interest.info.special'], {
      mode: 'strict',
    });
    const filtered = search.filter('(');

    expect(filtered.length).toEqual(4);
  });
  test('returns filtered on specified predicate function', () => {
    const search = S(
      (query, item) => item.name === query || item.interest.name === query
    );
    const filtered = search.filter('piano');

    expect(filtered.length).toEqual(1);
    expect(filtered[0]).toEqual(users[2]);
  });
});
