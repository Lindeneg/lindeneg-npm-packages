import { sanitize, reduceToString } from '../src/util';

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
    //@ts-expect-error asd
    expect(reduceToString(['hello', 'there', 'kenobi'], null)).toBe(
      'hello there kenobi'.trim()
    );
  });
  test('can reduce to string without key', () => {
    //@ts-expect-error asd
    expect(reduceToString(['hello', 'there', 'kenobi'], null)).toBe(
      'hello there kenobi'.trim()
    );
  });
  test('can reduce to string without entry and invalid key', () => {
    expect(reduceToString([], 'id')).toBe('');
  });
});
