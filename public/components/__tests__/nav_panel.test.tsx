/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { NavPanel } from '../nav_panel';
import { render, screen } from '../../../test/test_utils';

describe('<NavPanel />', () => {
  it('should render "Overview" with selected status', () => {
    render(<NavPanel />, { route: '/overview' });

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Overview').closest('a[class*=isSelected]')).toBeInTheDocument();
  });
  it('should render "Model Registry" with selected status', () => {
    render(<NavPanel />, { route: '/model-registry/model-list' });

    expect(screen.getByText('Model Registry')).toBeInTheDocument();
    expect(screen.getByText('Model Registry').closest('a[class*=isSelected]')).toBeInTheDocument();
  });
  it('should render nothing if nav item not exists', () => {
    const { container } = render(<NavPanel />, { route: '/model-registry/model/123' });

    expect(container).toBeEmptyDOMElement();
  });
});
