/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

import { EuiCallOut, EuiIcon, EuiLink } from '@elastic/eui';

export const ExperimentalWarning = () => {
  return (
    <div>
      <EuiCallOut title="Experiment Feature" iconType="iInCircle">
        <span>
          The feature is experimental and should not be used in a productuion environment.
        </span>
        <span>
          For more information,see{' '}
          <EuiLink href="#" style={{ color: '#006bb4' }}>
            Machine Learing Monitoring Documentation
          </EuiLink>
          {/* <span style={{ color: '#006bb4' }}>Machine Learing Monitoring Documentation</span> */}
          <EuiIcon type="popout" style={{ color: '#006bb4' }} />.
        </span>

        <p>
          <span>To leave feedback,</span>
          <EuiLink href="#" style={{ color: '#006bb4' }}>
            visit forum.opensearch.org
          </EuiLink>
          <EuiIcon type="popout" style={{ color: '#006bb4' }} />.
        </p>
      </EuiCallOut>
    </div>
  );
};
