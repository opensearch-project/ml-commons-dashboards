/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText, EuiTextColor, EuiCode, EuiSpacer } from '@elastic/eui';

import '../../ace-themes/sql_console.js';
import { ModelConfiguration } from '../common/forms/model_configuration';

export const ConfigurationPanel = () => {
  return (
    <div data-test-subj="ml-registerModelConfiguration">
      <EuiText size="s">
        <h3>Configuration</h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          The model configuration specifies the{' '}
          <EuiTextColor color="default">
            <EuiCode>model_type</EuiCode>
          </EuiTextColor>
          ,
          <EuiTextColor color="default">
            <EuiCode>embedding_dimension</EuiCode>
          </EuiTextColor>{' '}
          , and{' '}
          <EuiTextColor color="default">
            <EuiCode>framework_type</EuiCode>
          </EuiTextColor>{' '}
          of the model.
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <ModelConfiguration />
    </div>
  );
};
