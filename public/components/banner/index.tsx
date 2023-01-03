/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/* Vector */
// import { EuiIcon } from '@elastic/eui';
// export const Banner=()=>{
//     return (
//         <div>

//         </div>
//     );
// }

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
          For more information,see the Machine Learing Monitoring Documentation{' '}
          <EuiIcon type="popout" style={{ color: 'blue' }} />.
        </span>

        <p>
          <span>To leave feedback,</span>
          <span style={{ color: 'blue' }}>visit forum.opensearch.org</span>
          <EuiIcon type="popout" style={{ color: 'blue' }} />
        </p>
      </EuiCallOut>
    </div>
  );
};
