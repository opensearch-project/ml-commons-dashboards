/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import { Tag } from '../../../../../components/model/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { render, screen, within } from '../../../../../../test/test_utils';
import { TagField, TagGroup } from '../../model_tag_array_field/tag_field';

const TEST_TAG_GROUPS = [
  { name: 'Key1', type: 'string' as const, values: ['Value1'] },
  { name: 'Key2', type: 'number' as const, values: [0.95] },
];

const TestApp = ({
  index = 0,
  onDelete = jest.fn(),
  allowKeyCreate = true,
  tagGroups = TEST_TAG_GROUPS,
  defaultValues = { tags: [{ key: '', value: '', type: 'string' }] },
  readOnly = false,
}: {
  index?: number;
  onDelete?: (index: number) => void;
  allowKeyCreate?: boolean;
  tagGroups?: TagGroup[];
  defaultValues?: { tags: Tag[] };
  readOnly?: boolean;
}) => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <TagField
        index={index}
        onDelete={onDelete}
        tagGroups={tagGroups}
        allowKeyCreate={allowKeyCreate}
        readOnly={readOnly}
      />
    </FormProvider>
  );
};

describe('<TagField />', () => {
  it('should render tag field with key and value input', () => {
    render(<TestApp />);
    const keyContainer = screen.queryByTestId('ml-tagKey1');
    const valueContainer = screen.queryByTestId('ml-tagValue1');

    expect(keyContainer).toBeInTheDocument();
    expect(valueContainer).toBeInTheDocument();
  });

  it('tag value input should be disabled if tag key is empty', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    expect(valueInput).toBeDisabled();

    await user.type(keyInput, 'Key1{enter}');
    expect(valueInput).toBeEnabled();
  });

  it('should display tag key and value as readOnly', () => {
    render(
      <TestApp
        readOnly
        defaultValues={{ tags: [{ key: 'Key1', type: 'string' as const, value: 'Value1' }] }}
      />
    );
    expect(screen.getByDisplayValue('Key1')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Value1')).toHaveAttribute('readonly');
  });

  it('should NOT display delete button if tag field is readOnly', () => {
    render(
      <TestApp
        readOnly
        defaultValues={{ tags: [{ key: 'Key1', type: 'string' as const, value: 'Value1' }] }}
      />
    );
    expect(screen.queryByLabelText(/remove tag at row/i)).not.toBeInTheDocument();
  });

  it('should NOT allow to edit the tag key if the tag is a default tag', () => {
    render(
      <TestApp
        defaultValues={{ tags: [{ key: 'Key1', type: 'string' as const, value: 'Value1' }] }}
      />
    );
    // tag key should be readonly
    expect(screen.getByDisplayValue('Key1')).toHaveAttribute('readonly');
    // but we allow to edit tag value
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    expect(valueInput).not.toHaveAttribute('readonly');
    expect(valueInput).toBeEnabled();
  });

  it('should NOT display value type prepend', () => {
    render(
      <TestApp
        defaultValues={{ tags: [{ key: 'Key1', type: 'string' as const, value: 'Value1' }] }}
      />
    );
    // tag key should be readonly
    expect(screen.getByDisplayValue('Key1')).toHaveAttribute('readonly');
    // but we allow to edit tag value
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const prepend = within(valueContainer).queryByText('String');
    expect(prepend).not.toBeInTheDocument();
  });

  it('should display error when creating new tag key with more than 80 characters', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await user.type(keyInput, `${'x'.repeat(81)}{enter}`);
    expect(
      within(keyContainer).queryByText('80 characters allowed. Use 80 characters or less.')
    ).toBeInTheDocument();
  });

  it('should display error when creating new tag value with more than 80 characters', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await user.type(keyInput, 'dummy key{enter}');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    await user.type(valueInput, `${'x'.repeat(81)}{enter}`);
    expect(
      within(valueContainer).queryByText('80 characters allowed. Use 80 characters or less.')
    ).toBeInTheDocument();
  });

  it('should display "No keys found" and "No values found" if no tag keys and no tag values are provided', async () => {
    const user = userEvent.setup();
    render(<TestApp tagGroups={[]} />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await user.click(keyInput);
    expect(screen.getByText('No keys found. Add a key.')).toBeInTheDocument();

    await user.type(keyInput, 'dummy key{enter}');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    await user.click(valueInput);
    expect(screen.getByText('No values found. Add a value.')).toBeInTheDocument();
  });

  it('should NOT display "Key1" in the option list after "Key1" selected', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await user.click(keyInput);
    const optionListContainer = screen.getByTestId('comboBoxOptionsList');
    expect(within(optionListContainer).getByTitle('Key1')).toBeInTheDocument();

    await user.click(within(optionListContainer).getByTitle('Key1'));
    expect(within(optionListContainer).queryByTitle('Key1')).toBe(null);
  });

  it('should not allow to select tag type if selected an existed tag', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const keyInput = within(keyContainer).getByRole('textbox');

    await user.click(keyInput);
    // selected an existed tag
    await user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Key1'));

    expect(within(valueContainer).queryByLabelText('select tag type')).not.toBeInTheDocument();
  });

  it('should display a list of tag value for selection after selecting a tag key', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const keyInput = within(keyContainer).getByRole('textbox');
    const valueInput = within(valueContainer).getByRole('textbox');

    await user.click(keyInput);
    // selected an existed tag
    await user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Key1'));

    await user.click(valueInput);
    expect(
      within(screen.getByTestId('comboBoxOptionsList')).queryByTitle('Value1')
    ).toBeInTheDocument();
  });
});
