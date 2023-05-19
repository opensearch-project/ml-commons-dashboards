/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiRadioGroup, EuiText } from '@elastic/eui';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

const OPTIONS = [
  {
    id: 'source_not_changed',
    label: 'Keep existing',
  },
  {
    id: 'source_from_computer',
    label: 'Upload new from local file',
  },
  {
    id: 'source_from_url',
    label: 'Upload new from URL',
  },
];

export const VersionArtifactSource = () => {
  const { control } = useFormContext<{
    artifactSource: 'source_not_changed' | 'source_from_computer' | 'source_from_url';
  }>();

  const sourceArtifactControl = useController({
    name: 'artifactSource',
    control,
  });

  return (
    <EuiRadioGroup
      options={OPTIONS}
      idSelected={sourceArtifactControl.field.value}
      onChange={(id) => sourceArtifactControl.field.onChange(id)}
      legend={{
        children: (
          <EuiText size="xs">
            <h4>Artifact source</h4>
          </EuiText>
        ),
      }}
    />
  );
};
