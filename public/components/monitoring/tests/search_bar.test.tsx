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
  it('should searchbar changed when value changed', () => {
    let value = 'foo';
    render(<SearchBar onSearch={() => {}} value={value} />);
    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
    value = 'test';
    render(<SearchBar onSearch={() => {}} value={value} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('should callback onSearch in 200ms intervel when type', async () => {
    jest.useFakeTimers();
    const searchByNameOrId = jest.fn();
    render(<SearchBar onSearch={searchByNameOrId} value="foo" />);
    const $e = screen.getByPlaceholderText('Search by name or ID');
    await userEvent.type($e, 'foo');
    expect(searchByNameOrId).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(searchByNameOrId).toHaveBeenCalled();
  });
});
