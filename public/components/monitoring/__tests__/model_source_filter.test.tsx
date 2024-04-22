/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { ModelSourceFilter } from '../model_source_filter';

async function setup(value: Array<'local' | 'external'>) {
  const onChangeMock = jest.fn();
  const user = userEvent.setup({});
  render(<ModelSourceFilter value={value} onChange={onChangeMock} />);
  await user.click(screen.getByText('Source'));
  return { user, onChangeMock };
}

describe('<ModelSourceFilter />', () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 600,
    });
  });

  afterEach(() => {
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
  });

  it('should render Source filter and 1 selected filter number', async () => {
    await setup(['local']);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('1 active filters')).toBeInTheDocument();
  });

  it('should call onChange with consistent params after option click', async () => {
    const { user, onChangeMock } = await setup(['local']);

    await user.click(screen.getByText('External'));

    expect(onChangeMock).toHaveBeenLastCalledWith(['local', 'external']);
  });
});
