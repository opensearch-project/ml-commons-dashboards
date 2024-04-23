/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { render, RenderOptions } from '@testing-library/react';
import { DataSourceContextProvider } from '../public/contexts';

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nProvider>
      <DataSourceContextProvider>{children}</DataSourceContextProvider>
    </I18nProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
