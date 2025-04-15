/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';

import { ModelDescriptionField } from '../model_description_field';

const setup = (description: string = '', readOnly = false) => {
  const DescriptionForm = () => {
    const { control } = useForm({
      defaultValues: {
        description,
      },
    });
    return <ModelDescriptionField control={control} readOnly={readOnly} />;
  };

  render(<DescriptionForm />);

  const input = screen.getByLabelText<HTMLTextAreaElement>(/description/i);

  return {
    input,
    getHelpTextNode: () => input.nextSibling,
  };
};

describe('<ModelDescriptionField />', () => {
  it('should render "Description" title, content and "200 characters allowed" by default', () => {
    const { input, getHelpTextNode } = setup();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(getHelpTextNode()).toHaveTextContent('200 characters allowed');
  });

  it('should display 200 characters and show "0 characters left" after input 201 characters', async () => {
    const { input, getHelpTextNode } = setup();

    await userEvent.type(input, 'x'.repeat(201));

    expect(input.value).toHaveLength(200);

    expect(getHelpTextNode()).toHaveTextContent('0 characters left');
  });

  it('should set textarea to readOnly and hide help text', async () => {
    const { input, getHelpTextNode } = setup('foo', true);

    expect(input).toHaveAttribute('readonly');
    expect(getHelpTextNode()).not.toBeInTheDocument();
  });
});
