/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import userEvent from '@testing-library/user-event';

import { DebouncedSearchBar } from '../debounced_search_bar';
import { render, screen } from '../../../../test/test_utils';

describe('<DebouncedSearchBar />', () => {
  it('should render default search bar', () => {
    render(<DebouncedSearchBar onSearch={jest.fn} placeholder="Search by name or ID" />);
    expect(screen.getByPlaceholderText('Search by name or ID')).toBeInTheDocument();
  });

  it('should call onSearch with 400ms debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();

    const onSearch = jest.fn();
    render(<DebouncedSearchBar onSearch={onSearch} placeholder="Search by name or ID" />);

    await user.type(screen.getByPlaceholderText('Search by name or ID'), 'foo');
    expect(onSearch).not.toHaveBeenCalled();
    jest.advanceTimersByTime(400);
    expect(onSearch).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
