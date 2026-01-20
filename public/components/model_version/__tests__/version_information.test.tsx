/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { render, screen } from '../../../../test/test_utils';
import { ModelVersionFormData } from '../types';
import { ModelVersionInformation } from '../version_information';

const TestApp = () => {
  const form = useForm<ModelVersionFormData>({
    defaultValues: { versionNotes: 'test_version_notes' },
  });

  return (
    <FormProvider {...form}>
      <ModelVersionInformation />
    </FormProvider>
  );
};

describe('<ModelVersionInformation />', () => {
  it('should display version notes as readonly by default', () => {
    render(<TestApp />);
    expect(screen.getByLabelText('edit version notes')).toBeEnabled();
    expect(screen.getByDisplayValue('test_version_notes')).toHaveAttribute('readonly');
  });

  it('should allow to edit version notes after clicking edit button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    expect(screen.getByDisplayValue('test_version_notes')).toHaveAttribute('readonly');

    await user.click(screen.getByLabelText('edit version notes'));
    expect(screen.getByDisplayValue('test_version_notes')).toBeEnabled();
    expect(screen.getByLabelText('cancel edit version notes')).toBeInTheDocument();
  });

  it('should reset the version notes changes and set the input to disabled after clicking cancel button', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.click(screen.getByLabelText('edit version notes'));
    const versionNotesInput = screen.getByLabelText('Version notes');
    expect(versionNotesInput).toBeEnabled();

    await user.clear(versionNotesInput);
    await user.type(versionNotesInput, 'new_test_version_notes');
    // version notes input updated
    expect(screen.getByDisplayValue('new_test_version_notes')).toBeInTheDocument();

    await user.click(screen.getByLabelText('cancel edit version notes'));
    // reset to default value after clicking cancel button
    expect(screen.getByDisplayValue('test_version_notes')).toHaveAttribute('readonly');
  });
});
