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
    expect(screen.getByLabelText('Select model')).toBeInTheDocument();
  });
  it('should call onCloseModal after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onClickMock} />);
    await userEvent.click(screen.getByTestId('cancel button'));
    expect(onClickMock).toHaveBeenCalled();
  });
  it('should call drop-down list and link to url with selected option after click "Select modal" and continue', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.click(screen.getByLabelText('Open list of options'));
    expect(screen.getByTestId('titanOption')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('titanOption'));
    expect(screen.getByTestId('comboBoxInput')).toHaveTextContent('Titan');
    await userEvent.click(screen.getByTestId('continue button'));
    expect(document.URL).toContain('model-registry/register-model?name=Titan&version=Titan');
  });
  it('should link href after selecting "add your own model" and continue ', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByTestId('continue button'));
    expect(document.URL).toEqual('http://localhost/model-registry/register-model');
  });
});
