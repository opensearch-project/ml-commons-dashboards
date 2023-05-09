/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../test/test_utils';
import { BottomFormActionBar } from '../bottom_form_action_bar';

describe('<BottomFormActionBar />', () => {
  it('should display consistent unsaved changes and error count', () => {
    render(
      <BottomFormActionBar
        unSavedChangeCount={2}
        errorCount={1}
        onDiscardButtonClick={jest.fn()}
        formId="test-form-id"
      />
    );

    expect(screen.getByText('2 unsaved change(s)')).toBeInTheDocument();
    expect(screen.getByText('1 error(s)')).toBeInTheDocument();
  });

  it('should call onDiscardButtonClick when discard button is clicked', async () => {
    const onDiscardButtonClickMock = jest.fn();
    render(
      <BottomFormActionBar onDiscardButtonClick={onDiscardButtonClickMock} formId="test-form-id" />
    );

    expect(onDiscardButtonClickMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Discard change(s)'));
    expect(onDiscardButtonClickMock).toHaveBeenCalledTimes(1);
  });

  it('should submit form after save button clicked', async () => {
    const formId = 'test-form-id';
    const onSubmitMock = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmitMock} id={formId}>
        <BottomFormActionBar onDiscardButtonClick={jest.fn()} formId={formId} />
      </form>
    );

    expect(onSubmitMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Save'));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('should disabled save button and show loading indicator', () => {
    render(
      <BottomFormActionBar
        onDiscardButtonClick={jest.fn()}
        formId="test-form-id"
        isSaveButtonDisabled={true}
        isSaveButtonLoading={true}
      />
    );

    expect(screen.getByText('Save').closest('button')).toBeDisabled();
    expect(screen.getByText('Save').previousSibling).toHaveClass('euiLoadingSpinner');
  });
});
