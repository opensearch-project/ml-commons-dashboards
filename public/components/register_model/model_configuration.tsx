/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiTitle,
  EuiHorizontalRule,
  EuiCodeEditor,
  EuiText,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
} from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import '../../ace-themes/sql_console.js';
import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';

function validateConfigurationObject(value: string) {
  try {
    JSON.parse(value.trim());
  } catch {
    return false;
  }
  return true;
}

export const ConfigurationPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const configurationFieldController = useController({
    name: 'configuration',
    control: props.formControl,
    rules: { required: true, validate: validateConfigurationObject },
  });

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>Configuration</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFormRow
        style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
        label="Configuration object"
        isInvalid={Boolean(configurationFieldController.fieldState.error)}
        labelAppend={
          <EuiText size="xs">
            <EuiButtonEmpty onClick={() => setIsHelpVisible(true)} size="xs" color="primary">
              Help
            </EuiButtonEmpty>
          </EuiText>
        }
      >
        <EuiCodeEditor
          tabSize={2}
          theme="sql_console"
          width="100%"
          showPrintMargin={false}
          height="10rem"
          mode="json"
          value={configurationFieldController.field.value}
          onChange={(value) => configurationFieldController.field.onChange(value)}
          setOptions={{
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
        />
      </EuiFormRow>
      {isHelpVisible && (
        <EuiFlyout ownFocus onClose={() => setIsHelpVisible(false)}>
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id="flyoutTitle">Help</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiText>
              <p>TODO</p>
            </EuiText>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </EuiPanel>
  );
};
