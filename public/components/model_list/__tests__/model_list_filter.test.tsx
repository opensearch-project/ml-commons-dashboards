/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelListFilter } from '../model_list_filter';
import { act, render, screen, waitFor } from '../../../../test/test_utils';
import { TagFilterOperator } from '../../common';

describe('<ModelListFilter />', () => {
  it('should render default search bar with tag, deployed and owner filter', () => {
    render(<ModelListFilter value={{ tag: [], owner: [] }} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search by name, person, or keyword')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Deployed')).toBeInTheDocument();
    expect(screen.getByText('Undeployed')).toBeInTheDocument();
  });

  it('should render default search value, filter value and selected tags panel', () => {
    render(
      <ModelListFilter
        defaultSearch="foo"
        value={{
          tag: [{ name: 'tag1', operator: TagFilterOperator.IsNot, value: '123' }],
          owner: ['owner1'],
        }}
        onChange={() => {}}
      />
    );
    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
    expect(screen.queryAllByText('1')).toHaveLength(2);
    expect(screen.getByText('Deployed')).not.toHaveClass('euiFilterButton-hasActiveFilters');
    expect(screen.getByText('Undeployed')).not.toHaveClass('euiFilterButton-hasActiveFilters');
    expect(screen.getByTitle('NOT tag1: 123')).toBeInTheDocument();
  });

  it('should call onChange with consistent deployed value', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ModelListFilter value={{ tag: [], owner: [] }} onChange={onChangeMock} />
    );

    await user.click(screen.getByText('Deployed'));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ deployed: true }));

    rerender(
      <ModelListFilter value={{ tag: [], owner: [], deployed: true }} onChange={onChangeMock} />
    );
    await user.click(screen.getByText('Undeployed'));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ deployed: false }));

    rerender(
      <ModelListFilter value={{ tag: [], owner: [], deployed: false }} onChange={onChangeMock} />
    );
    await user.click(screen.getByText('Undeployed'));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ deployed: undefined }));
  });

  it('should call onChange with unique tags after tag filter updated', async () => {
    jest.useFakeTimers();
    const onChangeMock = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ModelListFilter
        defaultSearch="foo"
        value={{
          tag: [
            { name: 'Accuracy: test', operator: TagFilterOperator.Is, value: 'Computer vision' },
            {
              name: 'Accuracy: test',
              operator: TagFilterOperator.Is,
              value: 'Image classification',
            },
          ],
          owner: ['owner1'],
        }}
        onChange={onChangeMock}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await user.click(screen.getByTitle('Accuracy: test: Image classification'));

    await user.click(screen.getByText('Image classification'));
    await user.click(screen.getByRole('option', { name: 'Computer vision' }));
    await user.click(screen.getByText('Save'));

    expect(onChangeMock).toHaveBeenCalledWith({
      tag: [{ name: 'Accuracy: test', operator: TagFilterOperator.Is, value: 'Computer vision' }],
      owner: ['owner1'],
    });

    jest.useRealTimers();
  });
});
