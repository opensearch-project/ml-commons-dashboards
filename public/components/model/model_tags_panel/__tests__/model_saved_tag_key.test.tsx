/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { ModelSavedTagKey } from '../model_saved_tag_key';

describe('<ModelSavedTagKey />', () => {
  it('should render tag name and type be read-only by default', () => {
    render(
      <ModelSavedTagKey
        name="Accuracy: Test"
        type="number"
        showRemoveButton={false}
        index={0}
        onRemove={jest.fn()}
        showLabel={false}
      />
    );

    expect(screen.getByDisplayValue('Accuracy: Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Accuracy: Test')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Number')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Number')).toHaveAttribute('readonly');
  });

  it('should render tag key and type label if showLabel equal true', () => {
    render(
      <ModelSavedTagKey
        name="Accuracy: Test"
        type="number"
        showRemoveButton={false}
        index={0}
        onRemove={jest.fn()}
        showLabel
      />
    );

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('should render remove button and show delete confirmation modal after button clicked', async () => {
    render(
      <ModelSavedTagKey
        name="Accuracy: Test"
        type="number"
        showRemoveButton
        index={0}
        onRemove={jest.fn()}
        showLabel
      />
    );

    expect(screen.getByLabelText('Remove saved tag key at row 1')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Remove saved tag key at row 1'));
    expect(screen.getByText('Delete tag key?')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Deleting this tag key will remove the tag and the tag's values from all versions of this model. This action is irreversible."
      )
    ).toBeInTheDocument();
  });

  it('should call onRemove with index after confirm button clicked', async () => {
    const onRemoveMock = jest.fn();
    render(
      <ModelSavedTagKey
        name="Accuracy: Test"
        type="number"
        showRemoveButton
        index={0}
        onRemove={onRemoveMock}
        showLabel
      />
    );
    await userEvent.click(screen.getByLabelText('Remove saved tag key at row 1'));

    expect(onRemoveMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Delete tag key'));
    expect(onRemoveMock).toHaveBeenCalledWith(0);
  });

  it('should hide confirmation modal after cancel button clicked', async () => {
    const onRemoveMock = jest.fn();
    render(
      <ModelSavedTagKey
        name="Accuracy: Test"
        type="number"
        showRemoveButton
        index={0}
        onRemove={onRemoveMock}
        showLabel
      />
    );
    await userEvent.click(screen.getByLabelText('Remove saved tag key at row 1'));

    await userEvent.click(screen.getByText('Cancel'));
    expect(onRemoveMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete tag key?')).toBeNull();
  });
});
