/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../../test/test_utils';
import { ModelGroupVersionStatusCell } from '../model_group_version_status_cell';
import { MODEL_STATE } from '../../../../../common';

describe('<ModelGroupVersionStatusCell />', () => {
  it('should display "-" if unsupported state provided', async () => {
    render(<ModelGroupVersionStatusCell state={MODEL_STATE.trained} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display "In progress..." when state is "uploading" or "loading"', async () => {
    const { rerender } = render(<ModelGroupVersionStatusCell state={MODEL_STATE.uploading} />);

    expect(screen.getByText('In progress...')).toBeInTheDocument();

    rerender(<ModelGroupVersionStatusCell state={MODEL_STATE.loading} />);
    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });

  it('should display "Success" when state is "uploaded" or "loaded"', async () => {
    const { rerender } = render(<ModelGroupVersionStatusCell state={MODEL_STATE.loaded} />);

    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<ModelGroupVersionStatusCell state={MODEL_STATE.uploaded} />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should display "Error" when state is "registerFailed" or "loadedFailed"', async () => {
    const { rerender } = render(<ModelGroupVersionStatusCell state={MODEL_STATE.registerFailed} />);

    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<ModelGroupVersionStatusCell state={MODEL_STATE.loadFailed} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should display "Warning" when state is "partialLoaded"', async () => {
    const { rerender } = render(
      <ModelGroupVersionStatusCell state={MODEL_STATE.partiallyLoaded} />
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
