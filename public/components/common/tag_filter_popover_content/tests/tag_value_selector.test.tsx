/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { TagValueSelector } from '../tag_value_selector';
import { render, screen } from '../../../../../test/test_utils';

describe('<TagValueSelector />', () => {
  it('should display value selector and tag value options', async () => {
    const user = userEvent.setup();
    render(<TagValueSelector value={[]} onChange={jest.fn()} />);
    const selector = screen.getByText('Select a value');

    expect(selector).toBeInTheDocument();

    await user.click(selector);
    expect(screen.getByRole('option', { name: 'Computer vision' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Image classification' })).toBeInTheDocument();
  });

  it('should removed selected value in options list and display in the selector', async () => {
    const user = userEvent.setup();
    render(<TagValueSelector value={['Computer vision']} onChange={jest.fn()} />);

    expect(screen.getByText('Computer vision')).toBeInTheDocument();

    await user.click(screen.getByTestId('comboBoxToggleListButton'));
    expect(screen.queryByRole('option', { name: 'Computer vision' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Image classification' })).toBeInTheDocument();
  });

  it('should call onChange with selected values', async () => {
    const user = userEvent.setup();
    const onChangeMock = jest.fn();
    render(<TagValueSelector value={['Image classification']} onChange={onChangeMock} />);

    await user.click(screen.getByTestId('comboBoxToggleListButton'));
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));

    expect(onChangeMock).toHaveBeenCalledWith(['Image classification', 'Computer vision']);
  });

  it('should call onChange with string value', async () => {
    const user = userEvent.setup();
    const onChangeMock = jest.fn();
    render(
      <TagValueSelector value={['Image classification']} onChange={onChangeMock} singleSelection />
    );

    await user.click(screen.getByTestId('comboBoxToggleListButton'));
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));

    expect(onChangeMock).toHaveBeenCalledWith('Computer vision');
  });
});
