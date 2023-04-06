/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { render, RenderOptions } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';

export interface RenderWithRouteProps {
  route: string;
}

const history = {
  current: createBrowserHistory(),
};

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Router history={history.current}>
      <I18nProvider>{children}</I18nProvider>
    </Router>
  );
};

/**
 * Example 1: render with a route
 * customRender(<App />, {route: '/app'})
 *
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & RenderWithRouteProps
) => {
  const currentHistory = createBrowserHistory();
  history.current = currentHistory;

  if (options?.route) {
    currentHistory.push(options?.route);
  }

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };

export const mockOffsetMethods = () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 600,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 600,
  });
  return () => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight as PropertyDescriptor
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth as PropertyDescriptor
    );
  };
};
