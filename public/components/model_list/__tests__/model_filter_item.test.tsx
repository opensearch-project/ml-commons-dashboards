/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelFilterItem } from '../model_filter_item';

import { render, screen } from '../../../../test/test_utils';

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

  it('should call onClick with "foo" after click', async () => {
    const onClickMock = jest.fn();
    render(
      <ModelFilterItem checked="on" value="foo" onClick={onClickMock}>
        foo
      </ModelFilterItem>
    );
    await userEvent.click(screen.getByRole('option'));
    expect(onClickMock).toHaveBeenCalledWith('foo');
  });
});
