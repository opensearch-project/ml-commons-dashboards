/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { render, screen } from '../../../../test/test_utils';
import { ExperimentalWarning } from '..';

describe('<ExperimentalWarning />', () => {
  it('should navigate to # when clicking link of `Machine Learning Monitoring Documentation`', () => {
    render(<ExperimentalWarning />);
    const link = screen.getByText('Machine Learning Monitoring Documentation');
    expect(link.getAttribute('href')).toBe('#');
  });

  it('should navigate to # when clicking forum.opensearch.org', () => {
    render(<ExperimentalWarning />);
    const link = screen.getByText('forum.opensearch.org');
    expect(link.getAttribute('href')).toBe('#');
  });
});
