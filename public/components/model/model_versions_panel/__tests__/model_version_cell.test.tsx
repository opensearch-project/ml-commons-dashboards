/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../../test/test_utils';
import { ModelVersionCell } from '../model_version_cell';
import { MODEL_STATE } from '../../../../../common';

const setup = (options: { columnId: string; isDetails?: boolean }) =>
  render(
    <ModelVersionCell
      data={{
        id: '1',
        name: 'model-1',
        version: '1.0.0',
        state: MODEL_STATE.uploading,
        tags: {},
        lastUpdatedTime: 1682604957236,
        createdTime: 1682604957236,
      }}
      isDetails={false}
      {...options}
    />
  );

describe('<ModelVersionCell />', () => {
  it('should render consistent version', () => {
    setup({
      columnId: 'version',
    });

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('should render consistent deploy state', () => {
    const { rerender } = setup({
      columnId: 'state',
    });

    expect(screen.getByText('Not deployed')).toBeInTheDocument();

    rerender(
      <ModelVersionCell
        data={{
          id: '1',
          name: 'model-1',
          version: '1.0.0',
          state: MODEL_STATE.loaded,
          tags: {},
          lastUpdatedTime: 1682604957236,
          createdTime: 1682604957236,
        }}
        isDetails={false}
        columnId="state"
      />
    );
    expect(screen.getByText('Deployed')).toBeInTheDocument();

    rerender(
      <ModelVersionCell
        data={{
          id: '1',
          name: 'model-1',
          version: '1.0.0',
          state: MODEL_STATE.partiallyLoaded,
          tags: {},
          lastUpdatedTime: 1682604957236,
          createdTime: 1682604957236,
        }}
        isDetails={false}
        columnId="state"
      />
    );
    expect(screen.getByText('Deployed')).toBeInTheDocument();
  });

  it('should render consistent status', () => {
    setup({
      columnId: 'status',
    });

    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });

  it('should render status details', () => {
    setup({
      columnId: 'status',
      isDetails: true,
    });

    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });

  it('should render consistent last updated', () => {
    setup({
      columnId: 'lastUpdatedTime',
    });

    expect(screen.getByText('Apr 27, 2023 @ 14:15:57.236')).toBeInTheDocument();
  });

  it('should render "model-1" for name column', () => {
    setup({
      columnId: 'name',
    });

    expect(screen.getByText('model-1')).toBeInTheDocument();
  });

  it('should render "-" for unknown columId', () => {
    setup({
      columnId: 'unknown',
    });

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
