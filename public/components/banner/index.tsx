/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/* Vector */
import React from 'react';

import { EuiCallOut, EuiIcon } from '@elastic/eui';

export const Banner = () => {
  return (
    <div>
      <EuiCallOut title="Experiment Feature" iconType="iInCircle">
        <span>
          The feature is experimental and should not be used in a productuion environment.
        </span>
        <span>
          For more information,see{' '}
          <span style={{ color: '#006bb4' }}>Machine Learing Monitoring Documentation</span>
          <EuiIcon type="popout" style={{ color: '#006bb4' }} />.
        </span>

        <p>
          <span>To leave feedback,</span>
          <span style={{ color: '#006bb4' }}>visit forum.opensearch.org</span>
          <EuiIcon type="popout" style={{ color: '#006bb4' }} />
        </p>
      </EuiCallOut>
    </div>
  );
};
