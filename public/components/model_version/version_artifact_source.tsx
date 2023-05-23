/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiRadioGroup, EuiText } from '@elastic/eui';
import React, { useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';

type Source = 'source_not_changed' | 'source_from_computer' | 'source_from_url';

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

interface Props {
  onChange?: (source: Source) => void;
}

export const VersionArtifactSource = ({ onChange }: Props) => {
  const { control } = useFormContext<{
    artifactSource: Source;
  }>();

  const sourceArtifactControl = useController({
    name: 'artifactSource',
    control,
  });

  const onSourceChange = useCallback(
    (id: string) => {
      sourceArtifactControl.field.onChange(id);
      if (onChange) {
        onChange(id as Source);
      }
    },
    [sourceArtifactControl.field, onChange]
  );

  return (
    <EuiRadioGroup
      options={OPTIONS}
      idSelected={sourceArtifactControl.field.value}
      onChange={onSourceChange}
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
