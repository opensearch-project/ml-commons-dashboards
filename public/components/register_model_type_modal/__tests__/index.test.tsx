/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { RegisterModelTypeModal } from '../index';
import { render, screen, history } from '../../../../test/test_utils';

describe('<RegisterModelTypeModal />', () => {
  it('should render three checkable card', () => {
    render(<RegisterModelTypeModal onCloseModal={jest.fn()} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Add your own model')).toBeInTheDocument();
    expect(screen.getByLabelText('External source')).toBeInTheDocument();
  });

  it('should call onCloseModal after cancel button click', async () => {
    const onCloseModalMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onCloseModalMock} />);
    await userEvent.click(screen.getByTestId('cancelRegister'));
    expect(onCloseModalMock).toHaveBeenCalled();
  });

  it('should call onCloseModal after modal close icon click', async () => {
    const onCloseModalMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onCloseModalMock} />);
    await userEvent.click(screen.getByLabelText('Closes this modal window'));
    expect(onCloseModalMock).toHaveBeenCalled();
  });

  it('should go to repository model import page', async () => {
    render(<RegisterModelTypeModal onCloseModal={jest.fn()} />);

    await userEvent.click(screen.getByLabelText('Opensearch model repository'));
    await userEvent.click(screen.getByText('Continue'));
    expect(history.current.location.pathname).toEqual('/model-registry/register-model/');
    expect(history.current.location.search).toContain('type=import');
  });

  it('should go to model upload page', async () => {
    render(<RegisterModelTypeModal onCloseModal={jest.fn()} />);

    await userEvent.click(screen.getByLabelText('Add your own model'));
    await userEvent.click(screen.getByText('Continue'));
    expect(history.current.location.pathname).toEqual('/model-registry/register-model/');
    expect(history.current.location.search).toContain('type=upload');
  });

  it('should go to external model register page', async () => {
    render(<RegisterModelTypeModal onCloseModal={jest.fn()} />);

    await userEvent.click(screen.getByLabelText('External source'));
    await userEvent.click(screen.getByText('Continue'));
    expect(history.current.location.pathname).toEqual('/model-registry/register-model/');
    expect(history.current.location.search).toContain('type=external');
  });
});
