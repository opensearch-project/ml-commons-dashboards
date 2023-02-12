/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { RegisterModelTypeModal } from '../index';
import { render, screen } from '../../../../test/test_utils';
import { IOption } from '../index';
const options = [{ value: 'electra-small-generator', checked: 'on' }] as IOption[];
describe('<RegisterModelTypeModal />', () => {
  it('should render two checkablecard', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} options={options} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Add your own model')).toBeInTheDocument();
  });
  it('should render select with Opensearch model repository', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} options={options} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Searchable')).toBeInTheDocument();
  });
  it('should call onCloseModal after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onClickMock} options={options} />);
    await userEvent.click(screen.getByTestId('cancel button'));
    expect(onClickMock).toHaveBeenCalled();
  });
  it('should call drop-down list and link to url with selected option after click "Find model" and continue', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} options={options} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.click(screen.getByLabelText('Searchable'));
    expect(screen.getByTestId('selectableSearchHere')).toBeInTheDocument();
    expect(screen.getByTestId('selectableListHere')).toBeInTheDocument();
    expect(screen.getByTestId('selectableListHere')).toBeInTheDocument();
    // await userEvent.click(screen.getByTestId('aaa'));
    await userEvent.click(screen.getByTestId('continue button'));
    expect(document.URL).toContain('name=electra-small-generator&version=electra-small-generator');
  });
  it('should render null content when input a invalid text to search model', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} options={options} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.type(screen.getByLabelText('Searchable'), '1');
    expect(screen.getByText('No model found')).toBeInTheDocument();
  });
  it('should link href after selecting "add your own model" and continue ', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} options={options} />);
    await userEvent.click(screen.getByTestId('continue button'));
    expect(document.URL).toEqual('http://localhost/model-registry/register-model');
  });
});
