/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { Tag } from '../../../../../components/model/types';
import { render, screen } from '../../../../../../test/test_utils';
import { ModelTagArrayField } from '../model_tag_array_field';
import { TagGroup } from '../tag_field';

const TEST_TAG_GROUPS = [
  { name: 'Key1', type: 'string' as const, values: ['Value1'] },
  { name: 'Key2', type: 'number' as const, values: [0.95] },
];

const TestApp = ({
  allowKeyCreate = true,
  tagGroups = TEST_TAG_GROUPS,
  defaultValues = {
    tags: [
      { key: 'DefaultKey1', value: 'DefaultValue1', type: 'string' },
      { key: 'DefaultKey2', value: '1', type: 'number' },
    ],
  },
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
      <ModelTagArrayField tags={tagGroups} allowKeyCreate={allowKeyCreate} readOnly={readOnly} />
    </FormProvider>
  );
};

describe('<ModelTagArrayField />', () => {
  it('should display the default tags', () => {
    render(<TestApp />);
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(2);
    expect(screen.getByDisplayValue('DefaultKey1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('DefaultKey2')).toBeInTheDocument();
  });

  it('should allow to add multiple tags', async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Add two tags
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    await user.click(screen.getByRole('button', { name: /add tag/i }));

    // two new tag fields + two default tags
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(4);
  });

  it('should delete tag from the tag list', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(2);

    await user.click(screen.getByLabelText(/remove tag at row 1/i));
    expect(screen.getAllByTestId('ml-versionTagRow')).toHaveLength(1);
    expect(screen.getByDisplayValue('DefaultKey2')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('DefaultKey1')).not.toBeInTheDocument();
  });

  it('should not allow to add new tag if it is readOnly', () => {
    render(<TestApp readOnly />);
    expect(screen.queryByRole('button', { name: /add tag/i })).not.toBeInTheDocument();
  });
});
