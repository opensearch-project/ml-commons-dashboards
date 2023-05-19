/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { ModelVersionErrorDetailsModal } from '../model_version_error_details_modal';

describe('<ModelVersionErrorDetailsModal />', () => {
  it('should render model artifact upload failed screen', () => {
    render(
      <ModelVersionErrorDetailsModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetails="Error message"
        closeModal={jest.fn()}
        mode="artifact-upload-failed"
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
      <ModelVersionErrorDetailsModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetails={'{"foo": "bar"}'}
        closeModal={jest.fn()}
        mode="deployment-failed"
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
      <ModelVersionErrorDetailsModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetails={'{"foo": "bar"}'}
        closeModal={closeModalMock}
        mode="deployment-failed"
      />
    );

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByLabelText('Closes this modal window'));
    expect(closeModalMock).toHaveBeenCalledTimes(2);
  });
});
