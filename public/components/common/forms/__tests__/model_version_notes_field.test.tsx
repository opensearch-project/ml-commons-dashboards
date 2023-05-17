/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../../../test/test_utils';
import { ModelVersionNotesField } from '../model_version_notes_field';

const TestApp = ({ readOnly = false }: { readOnly?: boolean }) => {
  const form = useForm({
    defaultValues: { versionNotes: '' },
  });

  return (
    <ModelVersionNotesField control={form.control} label="Version notes" readOnly={readOnly} />
  );
};

describe('<ModelVersionNotesField />', () => {
  it('should render a version notes textarea field', () => {
    render(<TestApp />);
    expect(screen.queryByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeEnabled();
  });

  it('should render a readonly version notes input', () => {
    render(<TestApp readOnly />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should only allow maximum 200 characters', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.type(screen.getByRole('textbox'), 'x'.repeat(201));
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toHaveLength(200);
  });
});
