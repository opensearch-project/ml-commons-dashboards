/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { render, screen } from '../../../../test/test_utils';
import { ExperimentalWarning } from '../';
it('should navigete to # when link is clicked ', () => {
  render(<ExperimentalWarning />);
  const link = screen.getByText(
    'Machine Learning Monitoring Documentation' || 'visit forum.opensearch.org'
  );
  expect(link.getAttribute('href')).toBe('#');
});
