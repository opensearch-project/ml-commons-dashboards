/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { render, screen } from '../../../../test/test_utils';
import { ExperimentalWarning } from '..';
it('should navigete to # when first link is clicked ', () => {
  render(<ExperimentalWarning />);
  const link = screen.getByText('Machine Learning Monitoring Documentation');
  expect(link.getAttribute('href')).toBe('#');
});
it('should navigete to # when second link is clicked ', () => {
  render(<ExperimentalWarning />);
  const link = screen.getByText('visit forum.opensearch.org');
  expect(link.getAttribute('href')).toBe('#');
});
