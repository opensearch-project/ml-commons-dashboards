/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { CopyableText } from '../';

async function setup({ text = '', iconLeft = true }) {
  const user = userEvent.setup({});
  render(<CopyableText text={text} iconLeft={iconLeft} />);
  return { user };
}

describe('<CopyableText />', () => {
  it('should render text and icon', async () => {
    await setup({ text: 'copy' });
    expect(screen.getByText('copy')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy ID to clipboard')).toBeInTheDocument();
  });

  it('icon should be in the right of text when iconLeft is false ', async () => {
    await setup({ text: 'copy', iconLeft: false });
    expect(screen.getByText('copy')).toBeInTheDocument();
    expect(screen.getByTestId('copyable-text-div').firstChild?.nodeType).toBe(3);
  });

  it('icon should be in the left of text when iconLeft is true ', async () => {
    await setup({ text: 'test', iconLeft: true });
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('copyable-text-div').firstChild?.nodeType).toBe(1);
  });

  it('should copy text when click icon', async () => {
    document.execCommand = jest.fn();
    const { user } = await setup({ text: 'copy', iconLeft: true });
    expect(document.execCommand).not.toHaveBeenCalled();
    // there may be warnings in test env because of using eui copyToClipboard function
    await user.click(screen.getByLabelText('Copy ID to clipboard'));
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
