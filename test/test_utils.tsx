/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Provider as ReduxProvider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';

import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import { store } from '../redux/store';

export interface RenderWithRouteProps {
  route: string;
}

const history = {
  current: createBrowserHistory(),
};

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <Router history={history.current}>
        <I18nProvider>{children}</I18nProvider>
      </Router>
    </ReduxProvider>
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
