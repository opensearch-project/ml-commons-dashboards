/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../test/test_utils';
import { StageFilter } from '../stage_filter';

describe('<StageFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Stage" with 0 active filter for normal', () => {
    render(<StageFilter value={[]} onChange={() => {}} />);
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
