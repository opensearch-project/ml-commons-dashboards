/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { RegisterModelTypeModal } from '../index';
import { render, screen, waitFor } from '../../../../test/test_utils';

const mockOffsetMethods = () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 600,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 600,
  });
  return () => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight as PropertyDescriptor
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth as PropertyDescriptor
    );
  };
};

describe('<RegisterModelTypeModal />', () => {
  it('should render three checkablecard', () => {
    render(<RegisterModelTypeModal onCloseModal={() => {}} />);
    expect(screen.getByLabelText('Opensearch model repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Add your own model')).toBeInTheDocument();
    expect(screen.getByLabelText('External source')).toBeInTheDocument();
  });

  it('should call onCloseModal after click "cancel"', async () => {
    const onClickMock = jest.fn();
    render(<RegisterModelTypeModal onCloseModal={onClickMock} />);
    await userEvent.click(screen.getByTestId('cancelRegister'));
    expect(onClickMock).toHaveBeenCalled();
  });
});
