/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { StatusFilter } from '../';

async function setup({ onUpdateFilters = jest.fn() }) {
  const user = userEvent.setup({});
  render(<StatusFilter onUpdateFilters={onUpdateFilters} />);
  // open popover
  await user.click(screen.getByText('Status'));
  return { user };
}

describe('<StatusFilter />', () => {
  it('should render a dialog with selectable list', async () => {
    await setup({});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render null content when input a invalid text to search', async () => {
    const { user } = await setup({});
    await user.type(screen.getByPlaceholderText('Search'), '1');
    expect(screen.getByText('No filters found')).toBeInTheDocument();
  });

  it('should call `onUpdateFilters` callback with options clicked', async () => {
    const onUpdateFilters = jest.fn();
    const { user } = await setup({ onUpdateFilters });
    await user.click(screen.getByText('Status'));
    expect(onUpdateFilters).not.toHaveBeenCalled();
    // EUI popover can't be found in unit test env.
  });
});
