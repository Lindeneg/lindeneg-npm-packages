import { act, renderHook } from '@testing-library/react-hooks';
import useQueryParams from '../src';

describe('Test Suite: @lindeneg/query-params', () => {
  afterEach(() => {
    const base =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname;

    window.history.pushState({ path: base }, '', base);
  });
  test('can initialize without initial values', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: '', sort: '', theme: '' })
    );

    const { values } = result.current;

    expect(values.context).toBe('');
    expect(values.sort).toBe('');
    expect(values.theme).toBe('');
    expect(window.location.search).toBe('');
  });
  test('can initialize with initial values', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: 'articles', sort: '', theme: 'dark' })
    );

    const { values } = result.current;

    expect(values.context).toBe('articles');
    expect(values.sort).toBe('');
    expect(values.theme).toBe('dark');
    expect(window.location.search).toBe('?context=articles&theme=dark');
  });
  test('can change values', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: 'articles', sort: '', theme: 'dark' })
    );

    const { onParamChange } = result.current;

    act(() => {
      onParamChange('context', 'products');
    });

    const { values } = result.current;

    expect(values.context).toBe('products');
    expect(window.location.search).toBe('?context=products&theme=dark');
  });
  test('can add value', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: 'articles', sort: '', theme: 'dark' })
    );

    const { onParamChange } = result.current;

    act(() => {
      onParamChange('sort', 'desc');
    });

    const { values } = result.current;

    expect(values.sort).toBe('desc');
    expect(window.location.search).toBe(
      '?context=articles&theme=dark&sort=desc'
    );
  });
  test('can remove with default value', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: 'articles', sort: '', theme: 'dark' })
    );

    act(() => {
      result.current.onParamChange('context', 'products');
    });

    expect(result.current.values.context).toBe('products');
    expect(window.location.search).toBe('?context=products&theme=dark');

    act(() => {
      result.current.onParamChange('context', '');
    });

    expect(result.current.values.context).toBe('articles');
    expect(window.location.search).toBe('?context=articles&theme=dark');
  });
  test('can remove without default value', () => {
    const { result } = renderHook(() =>
      useQueryParams({ context: '', sort: '', theme: 'dark' })
    );

    act(() => {
      result.current.onParamChange('context', 'products');
    });

    expect(result.current.values.context).toBe('products');
    expect(window.location.search).toBe('?theme=dark&context=products');

    act(() => {
      result.current.onParamChange('context', '');
    });

    expect(result.current.values.context).toBe('');
    expect(window.location.search).toBe('?theme=dark');
  });
});
