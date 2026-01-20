/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { RegisterModelTypeModal } from '../index';
import { render, screen, waitFor } from '../../../../test/test_utils';

const mockOffsetMethods = () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 600,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 600,
  });
  return () => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight as PropertyDescriptor
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth as PropertyDescriptor
    );
  };
};

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
    const mockReset = mockOffsetMethods();
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    expect(screen.getByTestId('findModel')).toBeInTheDocument();
    expect(screen.getByTestId('opensearchModelList')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('sentence-transformers/all-distilroberta-v1')).toBeInTheDocument()
    );
    await userEvent.click(screen.getByText('sentence-transformers/all-distilroberta-v1'));
    await userEvent.click(screen.getByTestId('continueRegister'));
    expect(document.URL).toContain(
      'model-registry/register-model/?type=import&name=sentence-transformers/all-distilroberta-v1&version=sentence-transformers/all-distilroberta-v1'
    );
    mockReset();
  });

  it('should render no model found when input a invalid text to search model', async () => {
    const mockReset = mockOffsetMethods();
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await waitFor(() =>
      expect(screen.getByText('sentence-transformers/all-distilroberta-v1')).toBeInTheDocument()
    );
    await userEvent.type(screen.getByTestId('findModel'), 'foo');
    expect(screen.getByText('No model found')).toBeInTheDocument();
    mockReset();
  });

  it('should link href after selecting "add your own model" and continue ', async () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    await userEvent.click(screen.getByTestId('continueRegister'));
    expect(document.URL).toEqual('http://localhost/model-registry/register-model/?type=upload');
  });
});
