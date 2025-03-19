/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { render, screen } from '../../../../test/test_utils';
import { VersionArtifactSource } from '../version_artifact_source';

const TestApp = () => {
  const form = useForm({
    defaultValues: { artifactSource: 'source_not_changed' },
  });

  return (
    <FormProvider {...form}>
      <VersionArtifactSource />
    </FormProvider>
  );
};

describe('<VersionArtifactSource />', () => {
  it('should display artifact sources', () => {
    render(<TestApp />);
    expect(screen.getByLabelText('Keep existing')).toBeInTheDocument();
    expect(screen.getByLabelText('Keep existing')).toBeChecked();
    expect(screen.getByLabelText('Upload new from local file')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload new from URL')).toBeInTheDocument();
  });

  it('should change selected artifact source', async () => {
    const user = userEvent.setup();
    render(<TestApp />);
    await user.click(screen.getByLabelText('Upload new from local file'));
    expect(screen.getByLabelText('Upload new from local file')).toBeChecked();
  });
});
