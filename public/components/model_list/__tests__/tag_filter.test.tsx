/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../test/test_utils';
import { TagFilter } from '../tag_filter';

describe('<TagFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Tags" with 0 active filter for normal', () => {
    render(<TagFilter value={[]} onChange={() => {}} />);
    expect(screen.queryByText('Tags')).toBeInTheDocument();
    expect(screen.queryByText('0')).toBeInTheDocument();
  });
});
