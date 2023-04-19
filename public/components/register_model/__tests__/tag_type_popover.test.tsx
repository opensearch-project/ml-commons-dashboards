/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../test/test_utils';
import { TagTypePopover } from '../tag_type_popover';

describe('<TagTypePopover />', () => {
  it('should display tag type popover when clicking', async () => {
    const user = userEvent.setup();

    render(<TagTypePopover value="string" onApply={jest.fn()} />);
    expect(screen.queryByText('String')).toBeInTheDocument();

    // click button to show the popover
    await user.click(screen.getByText('String'));

    expect(screen.getByLabelText('String')).toBeChecked();
    expect(screen.getByLabelText('Number')).not.toBeChecked();
    expect(screen.queryByText('Apply')).toBeInTheDocument();
  });

  it('should call onApply', async () => {
    const user = userEvent.setup();
    const onApplyMock = jest.fn();

    render(<TagTypePopover value="string" onApply={onApplyMock} />);
    expect(screen.queryByText('String')).toBeInTheDocument();

    // click button to show the popover
    await user.click(screen.getByText('String'));

    // select Number
    await user.click(screen.getByLabelText('Number'));
    await user.click(screen.getByText('Apply'));

    expect(onApplyMock).toHaveBeenCalledWith('number');
  });
});
