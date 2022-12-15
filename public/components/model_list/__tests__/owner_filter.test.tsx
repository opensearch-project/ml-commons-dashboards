/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../test/test_utils';
import { OwnerFilter } from '../owner_filter';

describe('<OwnerFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Owner" with 0 active filter for normal', () => {
    render(<OwnerFilter value={[]} onChange={() => {}} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
