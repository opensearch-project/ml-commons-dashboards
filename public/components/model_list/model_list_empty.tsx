/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiEmptyPrompt, EuiLink, EuiSpacer, EuiButtonEmpty } from '@elastic/eui';
import React from 'react';

export const ModelListEmpty = () => {
  return (
    <div style={{ minHeight: 320, padding: '48 0' }}>
      <EuiEmptyPrompt
        title={<EuiSpacer size="s" />}
        body="Registered models will appear here."
        actions={
          <>
            <EuiSpacer size="s" />
            <EuiButton iconType="plusInCircle">Register model</EuiButton>
            <EuiSpacer size="m" />
            <EuiButtonEmpty>
              <EuiLink href="/todo" external>
                Read documentation
              </EuiLink>
            </EuiButtonEmpty>
          </>
        }
      />
    </div>
  );
};
