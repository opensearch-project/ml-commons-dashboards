/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within, mockOffsetMethods } from '../../../../test/test_utils';
import { VersionToggler } from '../version_toggler';

describe('<VersionToggler />', () => {
  let mockReset: Function;
  beforeEach(() => {
    mockReset = mockOffsetMethods();
  });

  afterEach(() => {
    mockReset();
  });

  it('should show currentVersion and version list', async () => {
    const user = userEvent.setup();
    render(
      <VersionToggler currentVersion="1.0.0" modelName="model1" onVersionChange={jest.fn()} />
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    await user.click(screen.getByText('v1.0.0'));
    expect(within(screen.getAllByRole('option')[0]).getByText('1.0.0')).toBeInTheDocument();
  });

  it('should call onVersionChange with consistent params', async () => {
    const user = userEvent.setup();
    const onVersionChange = jest.fn();
    render(
      <VersionToggler currentVersion="1.0.0" modelName="model1" onVersionChange={onVersionChange} />
    );

    await user.click(screen.getByText('v1.0.0'));
    await user.click(screen.getByText('1.0.1'));
    expect(onVersionChange).toHaveBeenCalledWith({
      newVersion: '1.0.1',
      newId: '2',
    });
  });
});
