/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { TagFilterPopoverContent, TagFilterPopoverProps } from '../tag_filter_popover_content';
import { render, screen } from '../../../../../test/test_utils';

const setup = (options?: Partial<TagFilterPopoverProps>) => {
  const user = userEvent.setup();
  const onCancelMock = jest.fn();
  const onSaveMock = jest.fn();
  const renderResult = render(
    <TagFilterPopoverContent
      tagKeys={[
        { name: 'foo', type: 'string' },
        { name: 'bar', type: 'number' },
      ]}
      onCancel={onCancelMock}
      onSave={onSaveMock}
      {...options}
    />
  );
  const tagKeySelector = screen.getByText('Select a tag key');
  const operatorSelector = screen.getByText('Select operator');
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  const saveButton = screen.getByRole('button', { name: 'Save' });

  return {
    user,
    renderResult,
    tagKeySelector,
    operatorSelector,
    cancelButton,
    saveButton,
    onCancelMock,
    onSaveMock,
  };
};

describe('<TagFilterPopoverContent />', () => {
  it('should show tag key selector, operator selector, cancel button and save button by default', async () => {
    const { tagKeySelector, operatorSelector, cancelButton, saveButton } = setup();

    expect(tagKeySelector).toBeInTheDocument();
    expect(operatorSelector).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('should display string tag key operators after string tag key selected', async () => {
    const { user, tagKeySelector, operatorSelector } = setup();

    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'foo' }));

    await user.click(operatorSelector);
    expect(screen.getByRole('option', { name: 'is' }));
    expect(screen.getByRole('option', { name: 'is not' }));
    expect(screen.getByRole('option', { name: 'is one of' }));
    expect(screen.getByRole('option', { name: 'is not one of' }));
  });

  it('should display number tag key operators after number tag key selected', async () => {
    const { user, tagKeySelector, operatorSelector } = setup();

    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'bar' }));

    await user.click(operatorSelector);
    expect(screen.getByRole('option', { name: 'is' }));
    expect(screen.getByRole('option', { name: 'is not' }));
    expect(screen.getByRole('option', { name: 'is greater than' }));
    expect(screen.getByRole('option', { name: 'is less than' }));
  });

  it('should display number input and call onSave with number value', async () => {
    const { user, tagKeySelector, operatorSelector, saveButton, onSaveMock } = setup();
    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'bar' }));

    await user.click(operatorSelector);
    await user.click(screen.getByRole('option', { name: 'is greater than' }));

    const valueInput = screen.getByPlaceholderText('Add a value');

    expect(valueInput).toBeInTheDocument();
    await user.type(valueInput, '0.98');
    await user.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledWith({
      name: 'bar',
      operator: 'is greater than',
      value: 0.98,
    });
  });

  it('should display value selector and call onSave with string value', async () => {
    const { user, tagKeySelector, operatorSelector, saveButton, onSaveMock } = setup();
    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'foo' }));

    await user.click(operatorSelector);
    await user.click(screen.getByRole('option', { name: 'is not' }));

    const valueSelector = screen.getByText('Select a value');

    expect(valueSelector).toBeInTheDocument();
    await user.click(valueSelector);
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));
    await user.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledWith({
      name: 'foo',
      operator: 'is not',
      value: 'Computer vision',
    });
  });

  it('should display value selector and call onSave with string array value', async () => {
    const { user, tagKeySelector, operatorSelector, saveButton, onSaveMock } = setup();
    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'foo' }));

    await user.click(operatorSelector);
    await user.click(screen.getByRole('option', { name: 'is one of' }));

    const valueSelector = screen.getByText('Select a value');

    expect(valueSelector).toBeInTheDocument();
    await user.click(valueSelector);
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));
    await user.click(screen.getByRole('option', { name: 'Image classification' }));
    await user.click(saveButton);

    expect(onSaveMock).toHaveBeenCalledWith({
      name: 'foo',
      operator: 'is one of',
      value: ['Computer vision', 'Image classification'],
    });
  });

  it('should call onCancel after cancel button clicked', async () => {
    const { user, cancelButton, onCancelMock } = setup();

    await user.click(cancelButton);
    expect(onCancelMock).toHaveBeenCalled();
  });

  it('should reset input after save button clicked', async () => {
    const { user, tagKeySelector, operatorSelector, saveButton } = setup({
      resetAfterSaveOrCancel: true,
    });
    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'bar' }));

    await user.click(operatorSelector);
    await user.click(screen.getByRole('option', { name: 'is greater than' }));

    const valueInput = screen.getByPlaceholderText('Add a value');

    expect(valueInput).toBeInTheDocument();
    await user.type(valueInput, '0.98');
    await user.click(saveButton);

    expect(screen.getByText('Select a tag key')).toBeInTheDocument();
    expect(screen.getByText('Select operator').closest('[role="combobox"]')).toHaveClass(
      'euiComboBox-isDisabled'
    );
    expect(valueInput).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('should reset input after cancel button clicked', async () => {
    const { user, tagKeySelector, operatorSelector, cancelButton, saveButton } = setup({
      resetAfterSaveOrCancel: true,
    });
    await user.click(tagKeySelector);
    await user.click(screen.getByRole('option', { name: 'foo' }));

    await user.click(operatorSelector);
    await user.click(screen.getByRole('option', { name: 'is not' }));

    const valueSelector = screen.getByText('Select a value');

    expect(valueSelector).toBeInTheDocument();
    await user.click(valueSelector);
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));
    await user.click(cancelButton);

    expect(screen.getByText('Select a tag key')).toBeInTheDocument();
    expect(screen.getByText('Select operator').closest('[role="combobox"]')).toHaveClass(
      'euiComboBox-isDisabled'
    );
    expect(valueSelector).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});
