/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Tag } from '../../../components/model/types';
import { ModelVersionTags } from '../version_tags';
import { render, screen, within } from '../../../../test/test_utils';
import userEvent from '@testing-library/user-event';

const TestApp = ({
  defaultValues = {
    tags: [
      { key: 'DefaultKey1', value: 'DefaultValue1', type: 'string' },
      { key: 'DefaultKey2', value: '0.85', type: 'number' },
    ],
  },
}: {
  defaultValues?: { tags: Tag[] };
}) => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <ModelVersionTags />
    </FormProvider>
  );
};

describe('<ModelVersionTags />', () => {
  it('should display tags as readonly by default', () => {
    render(<TestApp />);
    expect(screen.getByDisplayValue('DefaultKey1')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('DefaultKey2')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('DefaultValue1')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('0.85')).toHaveAttribute('readonly');
  });

  it('should enable tag list editing after clicking edit button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit tags'));
    // Edit button becomes Cancel button
    expect(screen.getByLabelText('cancel edit tags')).toBeInTheDocument();

    // Add tag button should be displayed
    expect(screen.getByRole('button', { name: /add tag/i })).toBeInTheDocument();

    // Delete button should be displayed
    expect(screen.queryAllByLabelText(/^remove tag at row .*$/i)).toHaveLength(2);
  });

  it('should reset tag array field after clicking cancel button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    await user.click(screen.getByLabelText('edit tags'));
    await user.click(screen.getByRole('button', { name: /add tag/i }));

    const keyContainer = screen.getByTestId('ml-tagKey3');
    const keyInput = within(keyContainer).getByRole('textbox');

    const valueContainer = screen.getByTestId('ml-tagValue3');
    const valueInput = within(valueContainer).getByRole('textbox');

    // add a new tag
    await user.type(keyInput, 'Key1{enter}');
    await user.type(valueInput, 'Value1{enter}');

    // change the value of an existing tag
    const numberValueInput = screen.getByDisplayValue('0.85');
    await user.clear(numberValueInput);
    await user.type(numberValueInput, '0.95');

    // now we have 3 tags: 2 default tags + 1 new tag
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(3);

    // click cancel button
    await user.click(screen.getByLabelText('cancel edit tags'));
    // reset to 2 tags, newly added tag is removed
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(2);
    // tag value change is reset
    expect(screen.queryByDisplayValue('0.85')).toBeInTheDocument();
  });
});
