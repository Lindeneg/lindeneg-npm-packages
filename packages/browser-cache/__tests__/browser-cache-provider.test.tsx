import React from 'react';
import { render } from '@testing-library/react';
import LS from '@lindeneg/ls-cache';
import type { CacheData } from '@lindeneg/cache';
import { BrowserCacheContextProvider } from '../src';
import { Component } from './__mock__/Component';
import type { TestObj } from './__mock__/Component';
import type { BrowserCacheContextProviderProps } from '../src';

const PREFIX = '__clch__';

function renderWithContext(
  config?: BrowserCacheContextProviderProps<TestObj>['config']
) {
  return render(
    <BrowserCacheContextProvider<TestObj>
      config={{ prefix: PREFIX, ...config }}
    >
      <Component />
    </BrowserCacheContextProvider>
  );
}

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

function mockSize() {
  return Object.keys(getMock()).length;
}

type MockData = ReturnType<typeof getMock>;
type MockKey = keyof MockData;

function setLS(data: MockData) {
  Object.keys(data).forEach((key) => {
    const entry = data[key as MockKey];
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  });
}

function getLS(key: MockKey) {
  const item = window.localStorage.getItem(`${PREFIX}${key}`);
  return item ? JSON.parse(item) : null;
}

function clearLS() {
  Object.keys(getMock()).forEach((key) => {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  });
}

function getValue(item: HTMLElement) {
  //@ts-expect-error testing
  return JSON.parse(item.getAttribute('data-value'));
}

describe('Test Suite: @lindeneg/browser-cache/provider', () => {
  beforeEach(() => {
    clearLS();
  });

  test('can render with context provider without initial localStorage data', () => {
    const { getByTestId } = renderWithContext();
    expect(getByTestId('some-id')).toBeDefined();
  });
  test('can render with context provider with initial localStorage data', () => {
    const data = getMock();
    setLS(data);
    const { getByTestId } = renderWithContext();
    expect(getByTestId('some-id').children.length).toEqual(mockSize());
    Object.keys(data).forEach((key) => {
      const item = getByTestId(key);
      expect(getValue(item)).toEqual(data[key as MockKey]);
    });
  });
  test('can add cache entry in provider from consumer', () => {
    const { getByTestId } = renderWithContext();

    getByTestId('add-btn').click();
    expect(getByTestId('some-id').children.length).toEqual(1);
    expect(getValue(getByTestId('id')).value).toEqual(55);
    expect(getLS('id').value).toEqual(55);
  });
  test('can remove cache entry in provider from consumer', () => {
    const data = getMock();
    setLS(data);
    const { getByTestId } = renderWithContext();

    getByTestId('remove-btn').click();

    expect(getByTestId('some-id').children.length).toEqual(mockSize() - 1);

    Object.keys(data)
      .slice(1)
      .forEach((key) => {
        const item = getByTestId(key);
        expect(getValue(item)).toEqual(data[key as MockKey]);
      });
  });
});
