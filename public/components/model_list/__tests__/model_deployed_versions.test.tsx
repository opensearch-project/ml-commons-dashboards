/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModelDeployedVersions } from '../model_deployed_versions';
import { render, screen } from '../../../../test/test_utils';

describe('<ModelDeployedVersions />', () => {
  it('should render "-" when pass empty versions', () => {
    render(<ModelDeployedVersions versions={[]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render displayed three versions', () => {
    render(<ModelDeployedVersions versions={['1', '2', '3']} />);
    expect(screen.getByText('1, 2, 3')).toBeInTheDocument();
  });

  it('should render displayed four versions', () => {
    render(<ModelDeployedVersions versions={['1', '2', '3', '4', '5']} />);
    expect(
      screen.getByText((_content, element) => {
        return element?.tagName === 'SPAN' && element?.textContent === '1, 2, 3, + 2 more';
      })
    ).toBeInTheDocument();
  });
});
