/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

import { EuiCallOut, EuiLink } from '@elastic/eui';

export const ExperimentalWarning = () => {
  return (
    <EuiCallOut title="Experiment Feature" iconType="iInCircle">
      <span>The feature is experimental and should not be used in a production environment.</span>
      <span>
        For more information,see{' '}
        <EuiLink href="#" external>
          Machine Learning Monitoring Documentation
        </EuiLink>
        .
      </span>

      <p>
        <span>To leave feedback, visit </span>
        <EuiLink href="#" external>
          forum.opensearch.org
        </EuiLink>
        .
      </p>
    </EuiCallOut>
  );
};
