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
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Add your own model')).toBeInTheDocument();
  });
  it('should render select with Opensearch model repository', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Select modal')).toBeInTheDocument();
  });
  it('should call onCloseModal after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onClickMock} />);
    await userEvent.click(screen.getByTestId('cancel button'));
    expect(onClickMock).toHaveBeenCalled();
  });
  it('should call drop-down list after click "Select modal"', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Open list of options'));
    expect(screen.getByTestId('titanOption')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('titanOption'));
    expect(screen.getByTestId('comboBoxInput')).toHaveTextContent('Titan');
    await userEvent.click(screen.getByTestId('continue button'));
    expect(
      document.URL.includes('/model-registry/register-model?name=Titan&version=Titan')
    ).toEqual(true);
  });
  // it('should link href after click "continue"', async () => {
  //   render(<RegisterModelTypeModal onCloseModal={() => {}} />);
  //   expect(
  //     screen.getByLabelText('Add your own model')
  //   ).toBeInTheDocument();
  //   await userEvent.click(screen.getByTestId('continue button'));
  //   expect(document.URL.includes('/model-registry/register-model')).toEqual(true);
  // });
  // it('should call onClick with null after click continue', async () => {
  //   const onClickMock = jest.fn();
  //   render(<RegisterModelTypeModal onCloseModal={() => {}} />);
  //   expect(
  //     screen.getByText('Add your own modal', { selector: 'EuiCheckableCard' })
  //   ).toBeInTheDocument();
  //   await userEvent.click(screen.getByText('Continue', { selector: 'EuiButton' }));
  //   expect(document.URL.includes('/model-registry/register-model')).toEqual(true);
  // });
});
