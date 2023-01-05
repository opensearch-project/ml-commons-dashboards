/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { ExperimentalWarning } from '../';
async function setup({ onUpdateFilters = jest.fn() }) {
  const user = userEvent.setup({});
  render(<ExperimentalWarning />);
  // open popover
  await user.click(
    screen.getByText('Machine Learing Monitoring Documentation' || 'visit forum.opensearch.org')
  );
  return { user };
}

it('should navigete to # when link is clicked ', async () => {
  const onUpdateFilters = jest.fn();
  const { user } = await setup({ onUpdateFilters });
  await user.click(screen.getByText('Status'));
  expect(onUpdateFilters).toHaveAttribute('href', '#');
});
