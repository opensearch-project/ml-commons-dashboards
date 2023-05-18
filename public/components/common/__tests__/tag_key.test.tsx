/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen } from '../../../../test/test_utils';
import { tagKeyOptionRenderer } from '../tag_key';

describe('tagKeyOptionRenderer', () => {
  it('should render consistent name and type', () => {
    render(tagKeyOptionRenderer({ label: 'F1', value: { name: 'F1', type: 'number' } }, '', ''));
    expect(screen.getByText('F1')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
  });
});
