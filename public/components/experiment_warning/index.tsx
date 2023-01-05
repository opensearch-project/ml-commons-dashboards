/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

import { EuiCallOut, EuiIcon, EuiLink } from '@elastic/eui';

export const ExperimentalWarning = () => {
  return (
    <EuiCallOut title="Experiment Feature" iconType="iInCircle">
      <span>The feature is experimental and should not be used in a productuion environment.</span>
      <span>
        For more information,see{' '}
        <EuiLink href="#" external>
          Machine Learning Monitoring Documentation
        </EuiLink>
        .
      </span>

      <p>
        <span>To leave feedback,</span>
        <EuiLink href="#" external>
          visit forum.opensearch.org
        </EuiLink>
        .
      </p>
    </EuiCallOut>
  );
};
