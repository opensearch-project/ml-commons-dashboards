/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import userEvent from '@testing-library/user-event';

import { SearchBar } from '../search_bar';
import { render, screen } from '../../../../test/test_utils';

describe('<SearchBar />', () => {
  it('should render default search bar', () => {
    render(<SearchBar onSearch={jest.fn} />);
    expect(screen.getByPlaceholderText('Search by model name or ID')).toBeInTheDocument();
  });

  it('should call onSearch with 400ms debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();

    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByPlaceholderText('Search by model name or ID'), 'foo');
    expect(onSearch).not.toHaveBeenCalled();
    jest.advanceTimersByTime(400);
    expect(onSearch).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
