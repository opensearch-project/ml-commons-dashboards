/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SearchBar } from '../search_bar';
import { render, screen } from '../../../../test/test_utils';

// import userEvent from '@testing-library/user-event';
describe('<SearchBar />', () => {
  it('should render default search bar', () => {
    render(<SearchBar onSearch={() => {}} value="foo" />);
    expect(screen.getByPlaceholderText('Search by name or ID')).toBeInTheDocument();
  });
});
