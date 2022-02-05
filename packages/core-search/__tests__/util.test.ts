import { sanitize, reduceToString, getNestedValue } from '../src/util';

const user = {
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
};

function cast<T>(arg: unknown) {
  return <T>arg;
}

describe('Test Suite: @lindeneg/core-search/util', () => {
  test('can sanitize input in lenient mode', () => {
    expect(sanitize('__asd.(', 'lenient')).toBe('\\_\\_asd\\.\\(');
  });
  test('can sanitize input in strict mode', () => {
    expect(sanitize('__asd.(', 'strict')).toBe('asd');
  });
  test('can reduce to string with key', () => {
    expect(
      reduceToString(
        [
          { id: 'hello', ignoreThis: 'nooo' },
          { id: 'there', ignoreThis: 'nooo2' },
          { id: 'kenobi', ignoreThis: 'nooo3' },
        ],
        'id'
      )
    ).toBe('hello there kenobi'.trim());
  });
  test('can reduce to string without key', () => {
    expect(reduceToString(cast(['hello', 'there', 'kenobi']), null)).toBe(
      'hello there kenobi'.trim()
    );
  });
  test('can reduce to string without key', () => {
    expect(reduceToString(cast(['hello', 'there', 'kenobi']), null)).toBe(
      'hello there kenobi'.trim()
    );
  });
  test('can reduce to string without entry and invalid key', () => {
    expect(reduceToString([{}], 'id')).toBe('');
  });
  test('can extract nested value using one layer', () => {
    expect(getNestedValue(user, ['id'])).toEqual('1');
  });
  test('can extract nested value using two layers', () => {
    expect(getNestedValue(user, ['interest', 'name'])).toEqual('trumpet');
  });
  test('can extract nested value using two layers from array', () => {
    expect(getNestedValue(cast(user.strings), ['n'])).toEqual(
      'something1 something2 something7'
    );
  });
  test('can extract nested value using three layers from object', () => {
    expect(getNestedValue(user, ['nested', 'arr', 'n', 'name'])).toEqual(
      ' kind of blue sketches of spain porgy and bess'
    );
  });
  test('can extract nested value using three layers from array', () => {
    expect(getNestedValue(user.nested.arr, ['name'])).toEqual(
      'kind of blue sketches of spain porgy and bess'
    );
  });
  test('can extract nothing given no keys', () => {
    expect(getNestedValue(user.nested.arr, [])).toEqual('');
  });
});
