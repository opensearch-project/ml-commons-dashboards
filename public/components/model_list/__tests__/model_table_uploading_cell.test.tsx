/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { ModelTableUploadingCell } from '../model_table_uploading_cell';
import { render, screen } from '../../../../test/test_utils';
import { MODEL_STATE } from '../../../../common';

describe('<ModelTableUploadingCell />', () => {
  it('should render "updating" if column is deployedVersions or createdAt', () => {
    const { rerender } = render(
      <ModelTableUploadingCell
        column="deployedVersions"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByText('updating')).toBeInTheDocument();

    rerender(
      <ModelTableUploadingCell
        column="createdAt"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByText('updating')).toBeInTheDocument();
  });

  it('should render loading spinner if column is latestVersion and owner', () => {
    const { rerender } = render(
      <ModelTableUploadingCell
        column="latestVersion"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    rerender(
      <ModelTableUploadingCell
        column="owner"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render "New model" if column is name', () => {
    render(
      <ModelTableUploadingCell
        column="name"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByText('New model')).toBeInTheDocument();
  });

  it('should render "..." if column is description', () => {
    render(
      <ModelTableUploadingCell
        column="description"
        fallback={<></>}
        latestVersionState={MODEL_STATE.uploading}
      />
    );
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should render fallback if not uploading state', () => {
    render(
      <ModelTableUploadingCell
        column="description"
        fallback={<>Foo Bar</>}
        latestVersionState={MODEL_STATE.loaded}
      />
    );
    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
  });
});
