/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { ModelFilter } from '../model_filter';
import { render, screen, fireEvent, act } from '../../../../test/test_utils';

describe('<ModelFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Tags" with 0 active filter', () => {
    render(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={[]}
        value={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render Tags with 2 active filter', () => {
    render(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={[]}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render options filter after click tags', () => {
    render(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search Tags')).not.toBeInTheDocument();
    act(() => {
      screen.getByText('Tags').click();
    });
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search Tags')).toBeInTheDocument();
  });

  it('should only show bar after search', () => {
    render(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );
    act(() => {
      screen.getByText('Tags').click();
    });
    expect(screen.getByText('foo')).toBeInTheDocument();

    act(() => {
      const serachTagsInput = screen.getByPlaceholderText('Search Tags');
      fireEvent.input(serachTagsInput, {
        target: { value: 'bar' },
      });
      fireEvent.keyUp(serachTagsInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    });
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('should call onChange with consistent value after option click', () => {
    const onChangeMock = jest.fn();
    const { rerender } = render(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={[]}
        onChange={onChangeMock}
      />
    );

    expect(onChangeMock).not.toHaveBeenCalled();

    act(() => {
      screen.getByText('Tags').click();
    });

    act(() => {
      screen.getByText('foo').click();
    });

    expect(onChangeMock).toHaveBeenCalledWith(['foo']);

    rerender(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo']}
        onChange={onChangeMock}
      />
    );
    act(() => {
      screen.getByText('bar').click();
    });

    expect(onChangeMock).toHaveBeenCalledWith(['foo', 'bar']);

    rerender(
      <ModelFilter
        displayName="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={onChangeMock}
      />
    );

    act(() => {
      screen.getByText('bar').click();
    });

    expect(onChangeMock).toHaveBeenCalledWith(['foo']);
  });
});
