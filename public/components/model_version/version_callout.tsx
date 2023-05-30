/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { EuiCallOut, EuiLoadingSpinner } from '@elastic/eui';
import { MODEL_VERSION_STATE } from '../../../common';

interface ModelVersionCalloutProps {
  modelVersionId: string;
  modelState: MODEL_VERSION_STATE;
}

const MODEL_VERSION_STATE_MAPPING: {
  [K in MODEL_VERSION_STATE]?: {
    title: React.ReactNode;
    color: 'danger' | 'warning' | 'primary';
    iconType?: string;
  };
} = {
  [MODEL_VERSION_STATE.registerFailed]: {
    title: 'Artifact upload failed',
    color: 'danger' as const,
    iconType: 'alert',
  },
  [MODEL_VERSION_STATE.deployFailed]: {
    title: 'Deployment failed',
    color: 'danger' as const,
    iconType: 'alert',
  },
  [MODEL_VERSION_STATE.partiallyDeployed]: {
    title: 'Model partially responding',
    color: 'warning' as const,
    iconType: 'alert',
  },
  [MODEL_VERSION_STATE.registering]: {
    title: (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <EuiLoadingSpinner size="m" style={{ marginRight: '8px' }} />
        Model artifact upload in progress
      </span>
    ),
    color: 'primary' as const,
  },
  [MODEL_VERSION_STATE.deploying]: {
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
  const calloutProps = MODEL_VERSION_STATE_MAPPING[modelState];

  useEffect(() => {
    if (calloutProps) {
      if (modelState === MODEL_VERSION_STATE.deployFailed) {
        // TODO: call task API to get the error details
      } else if (modelState === MODEL_VERSION_STATE.registerFailed) {
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
