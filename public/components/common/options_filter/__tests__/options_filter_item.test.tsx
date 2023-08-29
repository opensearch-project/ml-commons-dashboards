/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { OptionsFilterItem } from '../options_filter_item';

import { render, screen } from '../../../../../test/test_utils';

describe('<OptionsFilterItem />', () => {
  it('should render passed children and check icon', () => {
    render(
      <OptionsFilterItem checked="on" value="foo" onClick={() => {}}>
        foo
      </OptionsFilterItem>
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should call onClick with "foo" after click', async () => {
    const onClickMock = jest.fn();
    render(
      <OptionsFilterItem checked="on" value="foo" onClick={onClickMock}>
        foo
      </OptionsFilterItem>
    );
    await userEvent.click(screen.getByRole('option'));
    expect(onClickMock).toHaveBeenCalledWith('foo');
  });
});
