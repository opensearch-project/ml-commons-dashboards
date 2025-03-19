/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText, EuiSpacer } from '@elastic/eui';

import { ModelVersionNotesField } from '../common/forms/model_version_notes_field';

export const ModelVersionNotesPanel = () => {
  return (
    <div>
      <EuiText size="s">
        <h3>Version information</h3>
      </EuiText>
      <EuiSpacer size="m" />
      <ModelVersionNotesField
        label={
          <>
            Version notes - <i style={{ fontWeight: 300 }}>optional</i>{' '}
          </>
        }
      />
    </div>
  );
};
