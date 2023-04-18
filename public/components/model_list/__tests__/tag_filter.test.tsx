/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../../../test/test_utils';
import { TagFilter } from '../tag_filter';
import { TagFilterOperator } from '../../common';

describe('<TagFilter />', () => {
  it('should render "Tags" without number count by default', () => {
    render(<TagFilter tagKeysLoading={false} tagKeys={[]} value={[]} onChange={jest.fn()} />);
    expect(screen.queryByText('Tags')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should display active tag filters count', () => {
    render(
      <TagFilter
        tagKeysLoading={false}
        tagKeys={[]}
        value={[{ name: 'foo', operator: TagFilterOperator.Is, value: 'bar' }]}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it(
    'should call onChange with tag filter',
    async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onChangeMock = jest.fn();
      render(
        <TagFilter
          tagKeysLoading={false}
          tagKeys={[
            { name: 'Accuracy: test', type: 'string' as const },
            { name: 'F1', type: 'number' as const },
          ]}
          value={[]}
          onChange={onChangeMock}
        />
      );

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
    },
    // There are too many operations, need to increase timeout
    10 * 1000
  );

  it('should render empty screen after filter button click', async () => {
    const user = userEvent.setup();
    render(<TagFilter tagKeysLoading={false} tagKeys={[]} value={[]} onChange={jest.fn()} />);
    await user.click(screen.getByText('Tags'));

    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('should render loading screen after filter button click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const { rerender } = render(
      <TagFilter tagKeysLoading={true} tagKeys={[]} value={[]} onChange={jest.fn()} />
    );
    await user.click(screen.getByText('Tags'));
    rerender(
      <TagFilter
        tagKeysLoading={true}
        tagKeys={[
          { name: 'Accuracy: test', type: 'string' as const },
          { name: 'F1', type: 'number' as const },
        ]}
        value={[]}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Loading filters')).toBeInTheDocument();
  });

  it('should reset input after popover re-open', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onChangeMock = jest.fn();
    render(
      <TagFilter
        tagKeysLoading={false}
        tagKeys={[
          { name: 'Accuracy: test', type: 'string' as const },
          { name: 'F1', type: 'number' as const },
        ]}
        value={[]}
        onChange={onChangeMock}
      />
    );

    await user.click(screen.getByText('Tags'));

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
  });
});
