/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLoadingSpinner, EuiText } from '@elastic/eui';
import { MODEL_VERSION_STATE } from '../../../common';

type ColumnType =
  | 'name'
  | 'latestVersion'
  | 'description'
  | 'owner'
  | 'deployedVersions'
  | 'createdAt';

const getUploadingText = (column: ColumnType) => {
  switch (column) {
    case 'name':
      return 'New model';
    case 'description':
      return '...';
    default:
      return 'updating';
  }
};

export const ModelTableUploadingCell = ({
  column,
  fallback,
  latestVersionState,
}: {
  column: ColumnType;
  latestVersionState: MODEL_VERSION_STATE;
  fallback: JSX.Element;
}) => {
  if (latestVersionState !== MODEL_VERSION_STATE.registering) {
    return fallback;
  }
  if (column === 'latestVersion' || column === 'owner') {
    return <EuiLoadingSpinner role="progressbar" aria-busy="true" size="l" />;
  }
  return (
    <EuiText style={{ color: '#98A2B3', fontStyle: 'italic', fontSize: 14 }}>
      {getUploadingText(column)}
    </EuiText>
  );
};
