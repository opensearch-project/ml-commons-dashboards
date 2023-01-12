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
  it('should searchbar changed when value changed', async () => {
    const { rerender } = render(<SearchBar onSearch={() => {}} value="" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search by name or ID'), 'foo');
    expect(screen.getByLabelText('Search by name or ID')).toHaveValue('foo');
    const value = '';
    await rerender(<SearchBar onSearch={() => {}} value={value} />);
    expect(screen.getByLabelText('Search by name or ID')).not.toHaveValue();
  });
  it('should callback onSearch in 200ms when type', async () => {
    jest.useFakeTimers();
    const searchByNameOrId = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={searchByNameOrId} value="foo" />);
    await user.type(screen.getByPlaceholderText('Search by name or ID'), 'foo');
    expect(searchByNameOrId).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(searchByNameOrId).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
