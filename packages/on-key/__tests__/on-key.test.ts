import { act, renderHook } from '@testing-library/react-hooks';
import useOnKey from '../src';

describe('Test Suite: @lindeneg/on-key', () => {
  test('uses `keydown` as default type', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'k' });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('handles specified `keydown` type', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn, 'keydown'));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'k' });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('handles specified `keyup` type', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn, 'keyup'));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent('keyup', { key: 'k' });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('handles specified `pressed` type', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn, 'pressed'));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'k', repeat: true });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('respect option to not listen to repeat events', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn, 'keydown'));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'k', repeat: true });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(0);
  });
  test('does not confuse types', () => {
    const fn = jest.fn();
    renderHook(() => useOnKey('k', fn, 'keyup'));

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'k' });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(0);
  });
  test('callback receives event arg', () => {
    const fn = jest.fn((e) => {
      expect(e instanceof KeyboardEvent).toBe(true);
      expect(e.type).toBe('keyup');
    });
    renderHook(() => useOnKey('k', fn, 'keyup'));

    act(() => {
      const e = new KeyboardEvent('keyup', { key: 'k' });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
