/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render as originRender } from '@testing-library/react';

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
        errorType="artifact-upload-failed"
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
        errorType="deployment-failed"
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
        errorType="deployment-failed"
      />
    );

    expect(closeModalMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByLabelText('Closes this modal window'));
    expect(closeModalMock).toHaveBeenCalledTimes(2);
  });

  it('should render undeployment failed screen', () => {
    render(
      <ModelVersionErrorDetailsModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetails={'{"foo": "bar"}'}
        closeModal={jest.fn()}
        errorType="undeployment-failed"
      />
    );

    expect(screen.getByText('model-1-name version 3')).toBeInTheDocument();
    expect(screen.getByText('undeployment failed')).toBeInTheDocument();
    expect(screen.getByText('model-1-name version 3')).toHaveAttribute(
      'href',
      '/model-registry/model-version/model-1-id'
    );
    expect(screen.getByText('{"foo": "bar"}')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy')).toBeInTheDocument();
  });

  it('should render consistent plain model version link without react-router provider', () => {
    originRender(
      <ModelVersionErrorDetailsModal
        id="model-1-id"
        name="model-1-name"
        version="3"
        errorDetails={'{"foo": "bar"}'}
        closeModal={jest.fn()}
        errorType="undeployment-failed"
        plainVersionLink="/foo/model-registry/model-version/model-1-id"
      />
    );

    expect(screen.getByText('model-1-name version 3')).toHaveAttribute(
      'href',
      '/foo/model-registry/model-version/model-1-id'
    );
  });
});
