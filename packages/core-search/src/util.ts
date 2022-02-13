import type { EmptyObj } from '@lindeneg/types';
import type { SanitizeMode, EntryConstraint, KeyConstraint } from './types';

export const sanitize = function (str: string, mode: SanitizeMode) {
  const isStrict = mode === 'strict';
  return str.replace(/[^a-z0-9]/gi, (match) => {
    return isStrict || match === '\\' ? '' : '\\' + match;
  });
};

export function reduceToString(obj: Array<EmptyObj>, key: string | null) {
  return obj
    .reduce((a, b) => {
      const val = key ? b[key] : b;
      return a + ' ' + (val ? String(val) : '');
    }, '')
    .trim();
}

export function handleArray(keys: string[], current: EmptyObj[]) {
  const nKeys = keys.slice(1);
  const result =
    nKeys.length > 0
      ? current.reduce((a, b) => a + ' ' + getNestedValue(b, nKeys), '')
      : reduceToString(current, null);
  return result;
}

export function getNestedValue(obj: EntryConstraint, keys: string[]): string {
  const isArray = Array.isArray(obj);
  if (keys.length === 1) {
    const _key = keys[0];
    const result = isArray
      ? reduceToString(obj, _key === 'n' ? null : _key)
      : obj[_key];
    return result ? String(result) : '';
  }
  const newKeys = [...keys];
  const [key] = newKeys.splice(0, 1);
  const cur = <EntryConstraint>(!isArray ? obj[key] : obj[0]);
  if (!cur) {
    return '';
  } else if (Array.isArray(cur) && newKeys[0] === 'n') {
    return handleArray(newKeys, cur);
  }
  return getNestedValue(cur, newKeys);
}

export function $filter<T extends unknown[]>(
  obj: T,
  keys: KeyConstraint<T>,
  query: string,
  mode: SanitizeMode
): T {
  const sanitized = sanitize(query, mode).trim();
  if (!sanitized) {
    return obj;
  }
  const uniqueKeys = Array.from(new Set(keys))
    .map((e) => e.split('.'))
    .sort();
  return <T>obj.filter((entry) => {
    if (entry) {
      try {
        const targets = uniqueKeys.reduce(
          (a, b) => a + ' ' + getNestedValue(<EntryConstraint>entry, b),
          ''
        );
        return new RegExp(sanitized, 'gi').test(targets);
      // eslint-disable-next-line no-empty
      } catch (err) {}
    }
    return false;
  });
}
