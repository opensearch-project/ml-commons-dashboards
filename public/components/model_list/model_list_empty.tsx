/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiEmptyPrompt, EuiLink, EuiSpacer, EuiButtonEmpty } from '@elastic/eui';
import React from 'react';

import { RegisterNewModelButton } from './register_new_model_button';

export const ModelListEmpty = () => {
  return (
    <div style={{ minHeight: 320, padding: '48 0' }}>
      <EuiEmptyPrompt
        title={<EuiSpacer size="s" />}
        body="Registered models will appear here."
        actions={
          <>
            <EuiSpacer size="s" />
            <RegisterNewModelButton buttonProps={{ fill: false }} />
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
