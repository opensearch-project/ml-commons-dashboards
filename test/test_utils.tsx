import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { Provider as ReduxProvider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';

import { store } from '../redux/store';

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <I18nProvider>{children}</I18nProvider>
    </ReduxProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
