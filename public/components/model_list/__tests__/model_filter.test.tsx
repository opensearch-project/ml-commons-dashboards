/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
jest.mock('../../../apis/security');

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelFilter } from '../model_filter';
import { render, screen } from '../../../../test/test_utils';

describe('<ModelFilter />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render "Tags" with 0 active filter', () => {
    render(
      <ModelFilter
        name="Tags"
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
        name="Tags"
        searchPlaceholder="Search Tags"
        options={[]}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render options filter after filter button clicked', async () => {
    render(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search Tags')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Tags'));

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search Tags')).toBeInTheDocument();
  });

  it('should render passed footer after filter button clicked', async () => {
    const { getByText, queryByText } = render(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={() => {}}
        footer="footer"
      />
    );
    expect(queryByText('footer')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Tags'));
    expect(getByText('footer')).toBeInTheDocument();
  });

  it('should only show "bar" after search', async () => {
    render(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={() => {}}
      />
    );

    await userEvent.click(screen.getByText('Tags'));
    expect(screen.getByText('foo')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Search Tags'), 'bAr{enter}');
    expect(screen.queryByText('foo')).not.toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('should call onChange with consistent value after option click', async () => {
    const onChangeMock = jest.fn();
    const { rerender } = render(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={[]}
        onChange={onChangeMock}
      />
    );

    expect(onChangeMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('Tags'));
    await userEvent.click(screen.getByText('foo'));
    expect(onChangeMock).toHaveBeenCalledWith(['foo']);
    onChangeMock.mockClear();

    rerender(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo']}
        onChange={onChangeMock}
      />
    );

    await userEvent.click(screen.getByText('bar'));
    expect(onChangeMock).toHaveBeenCalledWith(['foo', 'bar']);
    onChangeMock.mockClear();

    rerender(
      <ModelFilter
        name="Tags"
        searchPlaceholder="Search Tags"
        options={['foo', 'bar']}
        value={['foo', 'bar']}
        onChange={onChangeMock}
      />
    );

    await userEvent.click(screen.getByText('bar'));
    expect(onChangeMock).toHaveBeenCalledWith(['foo']);
    onChangeMock.mockClear();
  });
});
