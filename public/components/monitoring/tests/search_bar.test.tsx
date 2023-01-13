/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SearchBar } from '../search_bar';
import { render, screen } from '../../../../test/test_utils';
import userEvent from '@testing-library/user-event';

describe('<SearchBar />', () => {
  it('should render default search bar', () => {
    render(<SearchBar onSearch={() => {}} value="foo" />);
    expect(screen.getByPlaceholderText('Search by name or ID')).toBeInTheDocument();
  });
  it('should change searchbar value after outside value change', async () => {
    jest.useFakeTimers();
    const { rerender } = render(<SearchBar onSearch={() => {}} value="" />);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByLabelText('Search by name or ID'), 'foo');
    expect(screen.getByLabelText('Search by name or ID')).toHaveValue('foo');
    jest.advanceTimersByTime(200);
    rerender(<SearchBar onSearch={() => {}} value="foo" />);
    rerender(<SearchBar onSearch={() => {}} value="" />);
    expect(screen.getByLabelText('Search by name or ID')).not.toHaveValue();
    jest.useRealTimers();
  });
  it('should callback onSearch in 200ms when type', async () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} value="foo" />);
    await user.type(screen.getByPlaceholderText('Search by name or ID'), 'foo');
    expect(onSearch).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(onSearch).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
