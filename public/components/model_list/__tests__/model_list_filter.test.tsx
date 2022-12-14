/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { ModelListFilter } from '../model_list_filter';
import { render, screen } from '../../../../test/test_utils';

describe('<ModelListFilter />', () => {
  it('should render default search bar with tag, stage and owner filter', () => {
    render(<ModelListFilter value={{ tag: [], stage: [], owner: [] }} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search by name, person, or keyword')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('should render default search value and filter value', () => {
    render(
      <ModelListFilter
        defaultSearch="foo"
        value={{ tag: ['tag1'], stage: ['stage1'], owner: ['owner1'] }}
        onChange={() => {}}
      />
    );
    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
    expect(screen.queryAllByText('1')).toHaveLength(3);
  });
});
