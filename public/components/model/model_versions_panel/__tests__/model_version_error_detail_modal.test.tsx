/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { ModelVersionErrorDetailModal } from '../model_version_error_detail_modal';

describe('<ModelVersionErrorDetailModal />', () => {
  it('should render model artifact upload failed screen', () => {
    render(
      <ModelVersionErrorDetailModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetail="Error message"
        closeModal={jest.fn()}
      />
    );

    expect(screen.getByText('model-1-name version 3')).toBeInTheDocument();
    expect(screen.getByText('artifact upload failed')).toBeInTheDocument();
    expect(screen.getByText('model-1-name version 3')).toHaveAttribute(
      'href',
      '/model-registry/model-version/model-1-id'
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render deployment failed screen', () => {
    render(
      <ModelVersionErrorDetailModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetail={'{"foo": "bar"}'}
        closeModal={jest.fn()}
        isDeployFailed
      />
    );

    expect(screen.getByText('model-1-name version 3')).toBeInTheDocument();
    expect(screen.getByText('deployment failed')).toBeInTheDocument();
    expect(screen.getByText('model-1-name version 3')).toHaveAttribute(
      'href',
      '/model-registry/model-version/model-1-id'
    );
    expect(screen.getByText('{"foo": "bar"}')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy')).toBeInTheDocument();
  });

  it('should call closeModal after Close button clicked', async () => {
    const closeModalMock = jest.fn();
    render(
      <ModelVersionErrorDetailModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetail={'{"foo": "bar"}'}
        closeModal={closeModalMock}
        isDeployFailed
      />
    );

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByLabelText('Closes this modal window'));
    expect(closeModalMock).toHaveBeenCalledTimes(2);
  });
});
