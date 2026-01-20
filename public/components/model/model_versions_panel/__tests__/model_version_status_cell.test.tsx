/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../../test/test_utils';
import { ModelVersionStatusCell } from '../model_version_status_cell';
import { MODEL_VERSION_STATE } from '../../../../../common';

describe('<ModelVersionStatusCell />', () => {
  it('should display "-" if unsupported state provided', async () => {
    render(<ModelVersionStatusCell state={MODEL_VERSION_STATE.trained} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display "In progress..." when state is "uploading" or "loading"', async () => {
    const { rerender } = render(<ModelVersionStatusCell state={MODEL_VERSION_STATE.registering} />);

    expect(screen.getByText('In progress...')).toBeInTheDocument();

    rerender(<ModelVersionStatusCell state={MODEL_VERSION_STATE.deploying} />);
    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });

  it('should display "Success" when state is "uploaded" or "loaded"', async () => {
    const { rerender } = render(<ModelVersionStatusCell state={MODEL_VERSION_STATE.deployed} />);

    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<ModelVersionStatusCell state={MODEL_VERSION_STATE.registered} />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should display "Error" when state is "registerFailed" or "loadedFailed"', async () => {
    const { rerender } = render(
      <ModelVersionStatusCell state={MODEL_VERSION_STATE.registerFailed} />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<ModelVersionStatusCell state={MODEL_VERSION_STATE.deployFailed} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should display "Warning" when state is "partialLoaded"', async () => {
    render(<ModelVersionStatusCell state={MODEL_VERSION_STATE.partiallyDeployed} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
