/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
jest.mock('../../../apis/security');

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, within } from '../../../../test/test_utils';
import { APIProvider } from '../../../apis/api_provider';
import { OwnerFilter } from '../owner_filter';

describe('<OwnerFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Owner" by default', async () => {
    const { getByText } = render(<OwnerFilter value={[]} onChange={() => {}} />);
    expect(getByText('Owner')).toBeInTheDocument();
  });

  it('should render three options with 1 checked option and 1 active filter', async () => {
    render(<OwnerFilter value={['admin']} onChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Owner'));
    const allOptions = screen.getAllByRole('option');
    expect(allOptions.length).toBe(3);
    expect(await within(allOptions[0]).getByText('admin (Me)')).toBeInTheDocument();
    expect(
      within(allOptions[0]).getByRole('img', { hidden: true }).querySelector('path')
    ).toBeInTheDocument();
    expect(within(allOptions[1]).getByText('owner-1')).toBeInTheDocument();
    expect(within(allOptions[2]).getByText('owner-2')).toBeInTheDocument();
  });

  it('should render "Show Only My Models" button with (Me) option', async () => {
    render(<OwnerFilter value={[]} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Owner'));
    expect(screen.getByText('Show Only My Models')).toBeInTheDocument();
    expect(screen.getByText('admin (Me)')).toBeInTheDocument();
  });

  it('should call onChange with user selection', async () => {
    const onChangeMock = jest.fn();
    const { rerender } = render(<OwnerFilter value={[]} onChange={onChangeMock} />);
    await userEvent.click(screen.getByText('Owner'));
    await userEvent.click(screen.getByText('owner-1'));
    expect(onChangeMock).toHaveBeenCalledWith(['owner-1']);
    onChangeMock.mockClear();

    rerender(<OwnerFilter value={['owner-1']} onChange={onChangeMock} />);
    await userEvent.click(screen.getByText('owner-1'));
    expect(onChangeMock).toHaveBeenCalledWith([]);
  });

  it('should call onChange with current user', async () => {
    const onChangeMock = jest.fn();
    render(<OwnerFilter value={['owner-1', 'owner-2']} onChange={onChangeMock} />);
    await userEvent.click(screen.getByText('Owner'));
    await userEvent.click(screen.getByText('Show Only My Models'));
    expect(onChangeMock).toHaveBeenCalledWith(['admin']);
  });

  it('should NOT render "Show Only My Models" button and "(Me)" option after error fetch account', async () => {
    jest
      .spyOn(APIProvider.getAPI('security'), 'getAccount')
      .mockRejectedValue(new Error('Failed to fetch account'));
    render(<OwnerFilter value={[]} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Owner'));
    expect(screen.queryByText('Show Only My Models')).not.toBeInTheDocument();
    expect(screen.queryByText('admin (Me)')).not.toBeInTheDocument();
  });
});
