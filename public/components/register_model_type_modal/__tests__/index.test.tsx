/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { RegisterModelTypeModal } from '../index';
import { render, screen } from '../../../../test/test_utils';
describe('<RegisterModelTypeModal />', () => {
  it('should render two checkablecard', () => {
    render(<RegisterModelTypeModal />);
    expect(
      screen.getByLabelText('Opensearch modal repository', { selector: 'EuiCheckableCard' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Add your own modal', { selector: 'EuiCheckableCard' })
    ).toBeInTheDocument();
  });
  it('should render select with Opensearch model repository', () => {
    render(<RegisterModelTypeModal />);
    expect(
      screen.getByLabelText('Opensearch modal repository', { selector: 'EuiCheckableCard' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Select modal', { selector: 'EuiComboBox' })).toBeInTheDocument();
  });
  it('should call onClick with null after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal />);
    await userEvent.click(screen.getByLabelText('Cancel', { selector: 'EuiButton' }));
    expect(onClickMock).toHaveBeenCalledWith('foo');
  });

  it('should call onClick with null after click "continue"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal />);
    expect(
      screen.getByLabelText('Add your own modal', { selector: 'EuiCheckableCard' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Continue', { selector: 'EuiButton' }));
    expect(document.URL.includes('/model-registry/register-model')).toEqual(true);
  });
  it('should call onClick with null after click continue', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal />);
    expect(
      screen.getByLabelText('Add your own modal', { selector: 'EuiCheckableCard' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Continue', { selector: 'EuiButton' }));
    expect(document.URL.includes('/model-registry/register-model')).toEqual(true);
  });
});
