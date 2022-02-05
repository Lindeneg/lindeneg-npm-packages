import React from 'react';
import { render } from '@testing-library/react';
import { CacheContextProvider } from '../src';
import { Component } from './__mock__/Component';
import type { TestObj } from './__mock__/Component';
import type { CacheContextProviderProps } from '../src';

function renderWithContext(
  config?: CacheContextProviderProps<TestObj>['config']
) {
  return render(
    <CacheContextProvider<TestObj> config={config}>
      <Component />
    </CacheContextProvider>
  );
}

describe('Test Suite: @lindeneg/browser-cache/provider', () => {
  test('can render with CacheContextProvider', () => {
    const { getByTestId } = renderWithContext();
    expect(getByTestId('some-id')).toBeDefined();
  });
});
