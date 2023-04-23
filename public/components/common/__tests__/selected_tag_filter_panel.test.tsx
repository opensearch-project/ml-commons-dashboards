/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../test/test_utils';
import { SelectedTagFiltersPanel } from '../selected_tag_filter_panel';
import { TagFilterOperator } from '../tag_filter_popover_content';

describe('<SelectedTagFilterPanel />', () => {
  it('should render regular filter items', () => {
    render(
      <SelectedTagFiltersPanel
        tagKeys={[]}
        tagFilters={[
          {
            name: 'Task',
            operator: TagFilterOperator.Is,
            value: 'Computer vision',
            type: 'string',
          },
          {
            name: 'Task',
            operator: TagFilterOperator.IsOneOf,
            value: ['Computer vision', 'Image classification'],
            type: 'string',
          },
          {
            name: 'F1',
            operator: TagFilterOperator.Is,
            value: 0.98,
            type: 'number',
          },
          {
            name: 'F1 weighted',
            operator: TagFilterOperator.IsGreaterThan,
            value: 0.99,
            type: 'number',
          },
          {
            name: 'F2',
            operator: TagFilterOperator.IsLessThan,
            value: 0.97,
            type: 'number',
          },
        ]}
        onTagFiltersChange={jest.fn()}
      />
    );

    expect(screen.getByText('Task: Computer vision'));
    expect(screen.getByText('Task is one of Computer vision, Image classification'));
    expect(screen.getByText('F1: 0.98'));
    expect(screen.getByText('F1 weighted > 0.99'));
    expect(screen.getByText('F2 < 0.97'));
  });

  it('should render "NOT" filter items', () => {
    render(
      <SelectedTagFiltersPanel
        tagKeys={[]}
        tagFilters={[
          {
            name: 'Task',
            operator: TagFilterOperator.IsNot,
            value: 'Computer vision',
            type: 'string',
          },
          {
            name: 'Task',
            operator: TagFilterOperator.IsNotOneOf,
            value: ['Computer vision', 'Image classification'],
            type: 'string',
          },
          {
            name: 'F1',
            operator: TagFilterOperator.IsNot,
            value: 0.98,
            type: 'number',
          },
        ]}
        onTagFiltersChange={jest.fn()}
      />
    );

    expect(screen.getByTitle('NOT Task: Computer vision'));
    expect(screen.getByTitle('NOT Task is one of Computer vision, Image classification'));
    expect(screen.getByTitle('NOT F1: 0.98'));
  });

  it('should call onTagFiltersChange after filter item removed', async () => {
    const user = userEvent.setup();
    const onTagFiltersChangeMock = jest.fn();
    render(
      <SelectedTagFiltersPanel
        tagKeys={[]}
        tagFilters={[
          {
            name: 'Task',
            operator: TagFilterOperator.IsNot,
            value: 'Computer vision',
            type: 'string',
          },
        ]}
        onTagFiltersChange={onTagFiltersChangeMock}
      />
    );
    expect(onTagFiltersChangeMock).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('Remove filter'));
    expect(onTagFiltersChangeMock).toHaveBeenCalledWith([]);
  });

  it(
    'should onTagFiltersChange after filter item updated',
    async () => {
      const user = userEvent.setup();
      const onTagFiltersChangeMock = jest.fn();
      render(
        <SelectedTagFiltersPanel
          tagKeys={[{ name: 'Task', type: 'string' as const }]}
          tagFilters={[
            {
              name: 'Task',
              operator: TagFilterOperator.IsNot,
              value: 'Computer vision',
              type: 'string',
            },
          ]}
          onTagFiltersChange={onTagFiltersChangeMock}
        />
      );
      expect(onTagFiltersChangeMock).not.toHaveBeenCalled();

      await user.click(screen.getByTitle('NOT Task: Computer vision'));
      await user.click(screen.getByText('Computer vision'));
      await user.click(screen.getByRole('option', { name: 'Image classification' }));
      await user.click(screen.getByText('Save'));

      expect(onTagFiltersChangeMock).toHaveBeenCalledWith([
        {
          name: 'Task',
          operator: TagFilterOperator.IsNot,
          value: 'Image classification',
          type: 'string',
        },
      ]);
    },
    // There are too many operations, need to increase timeout
    10 * 1000
  );
});
