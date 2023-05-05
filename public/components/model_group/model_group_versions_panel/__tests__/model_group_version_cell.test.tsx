/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../../test/test_utils';
import { ModelGroupVersionCell } from '../model_group_version_cell';
import { MODEL_STATE } from '../../../../../common';

const setup = (options: { columnId: string }) =>
  render(
    <ModelGroupVersionCell
      data={{
        id: '1',
        name: 'model-1',
        version: '1.0.0',
        state: MODEL_STATE.uploading,
        tags: {},
        lastUpdated: 1682604957236,
      }}
      {...options}
    />
  );

describe('<ModelGroupVersionCell />', () => {
  it('should render consistent version', () => {
    setup({
      columnId: 'version',
    });

    expect(screen.getByText('1.0.0'));
  });

  it('should render consistent deploy stage', () => {
    const { rerender } = setup({
      columnId: 'state',
    });

    expect(screen.getByText('Not deployed'));

    rerender(
      <ModelGroupVersionCell
        data={{
          id: '1',
          name: 'model-1',
          version: '1.0.0',
          state: MODEL_STATE.loaded,
          tags: {},
          lastUpdated: 1682604957236,
        }}
        columnId="state"
      />
    );
    expect(screen.getByText('Deployed'));

    rerender(
      <ModelGroupVersionCell
        data={{
          id: '1',
          name: 'model-1',
          version: '1.0.0',
          state: MODEL_STATE.partiallyLoaded,
          tags: {},
          lastUpdated: 1682604957236,
        }}
        columnId="state"
      />
    );
    expect(screen.getByText('Deployed'));
  });

  it('should render consistent status', () => {
    setup({
      columnId: 'status',
    });

    expect(screen.getByText('In progress...'));
    expect(screen.getByTestId('model-group-version-status'));
  });

  it('should render consistent last updated', () => {
    setup({
      columnId: 'lastUpdated',
    });

    expect(screen.getByText('Apr 27, 2023 2:15 PM'));
  });

  it('should render "model-1" for name column', () => {
    setup({
      columnId: 'name',
    });

    expect(screen.getByText('model-1'));
  });

  it('should render "-" for unknown columId', () => {
    setup({
      columnId: 'unknown',
    });

    expect(screen.getByText('-'));
  });
});
