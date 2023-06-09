/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { render, screen } from '../../../../test/test_utils';
import { ExperimentalWarning } from '..';

describe('<ExperimentalWarning />', () => {
  it('should navigate to # when clicking link of "Machine Learning Documentation"', () => {
    render(<ExperimentalWarning />);
    const link = screen.getByText('Machine Learning Documentation');
    expect(link.getAttribute('href')).toBe(
      'https://opensearch.org/docs/latest/ml-commons-plugin/ml-dashboard/'
    );
  });

  it('should navigate to # when clicking forum.opensearch.org', () => {
    render(<ExperimentalWarning />);
    const link = screen.getByText('forum.opensearch.org');
    expect(link.getAttribute('href')).toBe(
      'https://forum.opensearch.org/t/feedback-ml-commons-ml-model-health-dashboard-for-admins-experimental-release/12494'
    );
  });
});
