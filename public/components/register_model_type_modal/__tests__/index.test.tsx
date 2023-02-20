/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { RegisterModelTypeModal } from '../index';
import { render, screen } from '../../../../test/test_utils';
// const options = [{ name: 'electra-small-generator', checked: 'on' }] as IOption[];
describe('<RegisterModelTypeModal />', () => {
  it('should render two checkablecard', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Add your own model')).toBeInTheDocument();
  });

  it('should render select with Opensearch model repository', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('OpenSearch model repository models')).toBeInTheDocument();
  });

  it('should call onCloseModal after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onClickMock} />);
    await userEvent.click(screen.getByTestId('cancelRegister'));
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should call opensearch model repository model list and link to url with selected option after click "Find model" and continue', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.click(screen.getByLabelText('OpenSearch model repository models'));
    expect(screen.getByTestId('findModel')).toBeInTheDocument();
    expect(screen.getByTestId('opensearchModelList')).toBeInTheDocument();
    expect(screen.getByText('tapas-tiny')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('continueRegister'));
    expect(document.URL).toContain(
      'model-registry/register-model/?type=import&name=electra-small-generator&version=electra-small-generator'
    );
  });
  it('should render no model found when input a invalid text to search model', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.type(screen.getByLabelText('OpenSearch model repository models'), '1');
    expect(screen.getByText('No model found')).toBeInTheDocument();
  });

  it('should link href after selecting "add your own model" and continue ', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByTestId('continueRegister'));
    expect(document.URL).toEqual('http://localhost/model-registry/register-model/?type=upload');
  });
});
