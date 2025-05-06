/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelOwner } from '../model_owner';
import { render, screen } from '../../../../test/test_utils';

describe('<ModelOwner />', () => {
  it('should render avatar with name abbreviation', async () => {
    render(<ModelOwner name="Foo Bar" />);
    expect(screen.getByText('FB')).toBeInTheDocument();
  });
  it('should show tooltip when hower', async () => {
    jest.useFakeTimers();
    render(<ModelOwner name="Foo Bar" />);
    expect(screen.queryByText('Foo Bar')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('FB'), { delay: null });
    jest.advanceTimersByTime(1000);
    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
    jest.useRealTimers();
  });
});
