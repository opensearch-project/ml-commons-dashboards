/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { TypeTextConfirmModal } from '../type_text_confirm_modal';

const setup = () => {
  render(
    <TypeTextConfirmModal
      title="Delete model version 3?"
      textToType="model version 3"
      onCancel={jest.fn()}
      confirmButtonText="Delete"
    >
      foo
    </TypeTextConfirmModal>
  );
};

describe('<TypeTextConfirmModal />', () => {
  it('should render title, children, type to confirm tip, text input and disable delete button by default', () => {
    setup();

    expect(screen.getByText('Delete model version 3?')).toBeInTheDocument();
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByLabelText('Type model version 3 to confirm.')).toBeInTheDocument();
    expect(screen.getByLabelText('confirm text input')).toBeInTheDocument();
    expect(screen.getByText('Delete').closest('button')).toBeDisabled();
  });

  it('should disable delete button if typed text not match', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('confirm text input'), 'foobar');
    expect(screen.getByText('Delete').closest('button')).toBeDisabled();
  });

  it('should enable delete button if typed text matched', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('confirm text input'), 'model version 3');
    expect(screen.getByText('Delete').closest('button')).toBeEnabled();
  });
});
