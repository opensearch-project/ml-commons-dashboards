/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModelFilterItem } from '../model_filter_item';

import { render, screen, within } from '../../../../test/test_utils';
import { act } from '@testing-library/react-hooks';

describe('<ModelFilterItem />', () => {
  it('should render passed children and check icon', () => {
    render(
      <ModelFilterItem checked="on" value="foo" onClick={() => {}}>
        foo
      </ModelFilterItem>
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should call onClick with "foo" after click', () => {
    const onClickMock = jest.fn(() => {});
    render(
      <ModelFilterItem checked="on" value="foo" onClick={onClickMock}>
        foo
      </ModelFilterItem>
    );
    act(() => {
      screen.getByRole('option').click();
    });
    expect(onClickMock).toHaveBeenCalledWith('foo');
  });
});
