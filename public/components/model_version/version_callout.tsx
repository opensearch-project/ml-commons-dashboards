/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiCallOut, EuiLoadingSpinner } from '@elastic/eui';
import { MODEL_STATE } from '../../../common';

interface ModelVersionCalloutProps {
  modelVersionId: string;
  modelState: MODEL_STATE;
}

const MODEL_STATE_MAPPING: {
  [K in MODEL_STATE]?: {
    title: React.ReactNode;
    color: 'danger' | 'warning' | 'primary';
    iconType?: string;
  };
} = {
  [MODEL_STATE.registerFailed]: {
    title: 'Artifact upload failed',
    color: 'danger' as const,
    iconType: 'alert',
  },
  [MODEL_STATE.loadFailed]: {
    title: 'Deployment failed',
    color: 'danger' as const,
    iconType: 'alert',
  },
  [MODEL_STATE.partiallyLoaded]: {
    title: 'Model partially responding',
    color: 'warning' as const,
    iconType: 'alert',
  },
  [MODEL_STATE.uploading]: {
    title: (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <EuiLoadingSpinner size="m" style={{ marginRight: '8px' }} />
        Model artifact upload in progress
      </span>
    ),
    color: 'primary' as const,
  },
  [MODEL_STATE.loading]: {
    title: (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <EuiLoadingSpinner size="m" style={{ marginRight: '8px' }} />
        Model deployment in progress
      </span>
    ),
    color: 'primary' as const,
  },
};

export const ModelVersionCallout = ({ modelState, modelVersionId }: ModelVersionCalloutProps) => {
  const calloutProps = MODEL_STATE_MAPPING[modelState];

  useEffect(() => {
    if (calloutProps) {
      if (modelState === MODEL_STATE.loadFailed) {
        // TODO: call task API to get the error details
      } else if (modelState === MODEL_STATE.registerFailed) {
        // TODO: call task API to get the error details
      }
    }
  }, [modelVersionId, modelState, calloutProps]);

  if (!calloutProps) {
    return null;
  }

  return (
    <EuiCallOut
      title={calloutProps.title}
      color={calloutProps.color}
      iconType={'iconType' in calloutProps ? calloutProps.iconType : undefined}
    >
      Error details: TODO
    </EuiCallOut>
  );
};
