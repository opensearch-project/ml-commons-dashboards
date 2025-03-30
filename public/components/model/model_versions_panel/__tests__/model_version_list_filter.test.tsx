/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { act, render, screen, within } from '../../../../../test/test_utils';
import { ModelVersionListFilter } from '../model_version_list_filter';
import { TagFilterOperator } from '../../../common';

describe('<ModelVersionListFilter />', () => {
  it('should render default search bar, state, status and Add tag filter', () => {
    render(
      <ModelVersionListFilter value={{ tag: [], state: [], status: [] }} onChange={jest.fn()} />
    );
    expect(screen.getByPlaceholderText('Search by version number, or keyword')).toBeInTheDocument();

    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Add tag filter')).toBeInTheDocument();
  });

  it('should render activate filter count and tags after value provided', () => {
    render(
      <ModelVersionListFilter
        value={{
          tag: [{ name: 'tag1', operator: TagFilterOperator.IsNot, value: '123', type: 'string' }],
          state: ['Deployed'],
          status: ['InProgress', 'Success'],
        }}
        onChange={jest.fn()}
      />
    );

    expect(within(screen.getByText('State').parentElement!).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByText('Status').parentElement!).getByText('2')).toBeInTheDocument();
    expect(screen.getByTitle('NOT tag1: 123')).toBeInTheDocument();
  });

  it('should call onChangeMock with new state after state filter changed', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <ModelVersionListFilter value={{ tag: [], state: [], status: [] }} onChange={onChangeMock} />
    );

    await user.click(screen.getByText('State'));

    expect(onChangeMock).not.toHaveBeenCalled();
    await user.click(screen.getByText('Deployed'));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ state: ['Deployed'] }));
  });

  it('should call onChangeMock with new status after status filter changed', async () => {
    const onChangeMock = jest.fn();
    const user = userEvent.setup();
    render(
      <ModelVersionListFilter value={{ tag: [], state: [], status: [] }} onChange={onChangeMock} />
    );

    await user.click(screen.getByText('Status'));

    expect(onChangeMock).not.toHaveBeenCalled();
    await user.click(screen.getByText('Success'));
    expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ status: ['Success'] }));
  });

  it(
    'should call onChangeMock with new tag after tag filter changed',
    async () => {
      jest.useFakeTimers();
      const onChangeMock = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <ModelVersionListFilter
          value={{
            tag: [
              {
                name: 'Accuracy: test',
                operator: TagFilterOperator.Is,
                value: 'Computer vision',
                type: 'string',
              },
              {
                name: 'Accuracy: test',
                operator: TagFilterOperator.Is,
                value: 'Image classification',
                type: 'string',
              },
            ],
            state: [],
            status: [],
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

      expect(onChangeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tag: [
            {
              name: 'Accuracy: test',
              operator: TagFilterOperator.Is,
              value: 'Computer vision',
              type: 'string',
            },
          ],
        })
      );

      jest.useRealTimers();
    },
    10 * 1000
  );

  it('should call onChangeMock with search text after search text typed', async () => {
    jest.useFakeTimers();
    const onChangeMock = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ModelVersionListFilter
        value={{
          tag: [],
          state: [],
          status: [],
        }}
        onChange={onChangeMock}
      />
    );

    expect(onChangeMock).not.toHaveBeenCalled();

    await user.type(
      screen.getByPlaceholderText('Search by version number, or keyword'),
      'search text'
    );
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'search text',
      })
    );

    jest.useRealTimers();
  });

  it('should bind searchInput and able to clear search text by searchInputRef', async () => {
    const onChangeMock = jest.fn();
    let searchInput: HTMLInputElement | null = null;

    render(
      <ModelVersionListFilter
        value={{
          tag: [],
          state: [],
          status: [],
        }}
        onChange={onChangeMock}
        searchInputRef={(input: HTMLInputElement | null) => {
          searchInput = input;
        }}
      />
    );
    expect(searchInput).not.toBeNull();

    const searchTextInput = screen.getByPlaceholderText('Search by version number, or keyword');
    await userEvent.type(searchTextInput, 'search text');

    expect(searchTextInput).toHaveValue('search text');
    searchInput!.value = '';
    expect(searchTextInput).toHaveValue('');
  });
});
