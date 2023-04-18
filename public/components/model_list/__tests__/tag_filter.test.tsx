/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { act, render, screen, waitFor } from '../../../../test/test_utils';
import { TagFilter } from '../tag_filter';
import * as modelListHooks from '../model_list.hooks';
import { TagFilterOperator } from '../../common';

describe('<TagFilter />', () => {
  it('should render "Tags" without number count by default', () => {
    render(<TagFilter value={[]} onChange={jest.fn()} />);
    expect(screen.queryByText('Tags')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should display active tag filters count', () => {
    render(
      <TagFilter
        value={[{ name: 'foo', operator: TagFilterOperator.Is, value: 'bar' }]}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it(
    'should call onChange with tag filter',
    async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onChangeMock = jest.fn();
      render(<TagFilter value={[]} onChange={onChangeMock} />);
      // Make get model tag keys API return faster
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await user.click(screen.getByText('Tags'));
      await waitFor(() => {
        expect(screen.getByText('Select a tag key')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Select a tag key'));
      await user.click(screen.getByRole('option', { name: 'F1' }));
      await user.click(screen.getByText('Select operator'));
      await user.click(screen.getByRole('option', { name: 'is' }));
      await user.type(screen.getByPlaceholderText('Add a value'), '0.92', {});
      await user.click(screen.getByText('Save'));

      expect(onChangeMock).toHaveBeenCalledWith([
        {
          name: 'F1',
          operator: 'is',
          value: 0.92,
        },
      ]);
      jest.useRealTimers();
    },
    // There are too many operations, need to increase timeout
    10 * 1000
  );

  it('should render empty screen after filter button click', async () => {
    const useModelTagKeysMock = jest
      .spyOn(modelListHooks, 'useModelTagKeys')
      .mockReturnValue([false, []]);
    const user = userEvent.setup();
    render(<TagFilter value={[]} onChange={jest.fn()} />);
    await user.click(screen.getByText('Tags'));

    expect(screen.getByText('No options found')).toBeInTheDocument();
    useModelTagKeysMock.mockRestore();
  });

  it('should render loading screen after filter button click', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<TagFilter value={[]} onChange={jest.fn()} />);
    await user.click(screen.getByText('Tags'));

    expect(screen.getByText('Loading filters')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('should reset input after popover re-open', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChangeMock = jest.fn();
    render(<TagFilter value={[]} onChange={onChangeMock} />);

    await user.click(screen.getByText('Tags'));
    // Make get model tag keys API return faster
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByText('Select a tag key')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Select a tag key'));
    await user.click(screen.getByRole('option', { name: 'F1' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    await user.click(screen.getByText('Tags'));
    expect(screen.getByText('Select a tag key')).toBeInTheDocument();
    expect(screen.getByText('Select operator').closest('[role="combobox"]')).toHaveClass(
      'euiComboBox-isDisabled'
    );

    jest.useRealTimers();
  });
});
