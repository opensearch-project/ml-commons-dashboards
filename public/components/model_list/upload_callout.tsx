/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLoadingSpinner } from '@elastic/eui';

export interface UploadCalloutProps {
  models: string[];
}

export const UploadCallout = ({ models }: UploadCalloutProps) => {
  return (
    <EuiCallOut
      data-test-subj="uploadCallout"
      iconType={EuiLoadingSpinner}
      title={`${models.length} upload in progress`}
    >
      {models.join(', ')} is uploading to the model registry.
    </EuiCallOut>
  );
};
