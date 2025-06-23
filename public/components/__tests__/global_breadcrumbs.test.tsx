/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GlobalBreadcrumbs } from '../global_breadcrumbs';
import { render } from '../../../test/test_utils';

describe('<GlobalBreadcrumbs />', () => {
  it('should call onBreadcrumbsChange with overview title', () => {
    const onBreadcrumbsChange = jest.fn();
    render(<GlobalBreadcrumbs onBreadcrumbsChange={onBreadcrumbsChange} basename="/foo" />, {
      route: '/overview',
    });

    expect(onBreadcrumbsChange).toHaveBeenCalledWith([
      { text: 'Machine Learning', href: '/foo' },
      { text: 'Overview' },
    ]);
  });
});
