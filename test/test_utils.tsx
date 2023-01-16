/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Provider as ReduxProvider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { store } from '../redux/store';

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <Router history={createBrowserHistory()}>
        <I18nProvider>{children}</I18nProvider>
      </Router>
    </ReduxProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
