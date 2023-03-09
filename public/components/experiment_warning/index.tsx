/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

import { EuiCallOut, EuiLink } from '@elastic/eui';

export const ExperimentalWarning = () => {
  return (
    <EuiCallOut title="Experimental Feature" iconType="iInCircle">
      The feature is experimental and should not be used in a production environment. For more
      information, see{' '}
      <EuiLink href="https://opensearch.org/docs/latest/ml-commons-plugin/ml-dashbaord/" external>
        Machine Learning Documentation
      </EuiLink>
      . To leave feedback, visit{' '}
      <EuiLink
        href="https://forum.opensearch.org/t/feedback-ml-commons-ml-model-health-dashboard-for-admins-experimental-release/12494"
        external
      >
        forum.opensearch.org
      </EuiLink>
      .
    </EuiCallOut>
  );
};
