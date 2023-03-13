/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFormRow,
  EuiTitle,
  EuiCodeEditor,
  EuiText,
  EuiTextColor,
  EuiCode,
  EuiSpacer,
  EuiButtonEmpty,
} from '@elastic/eui';
import { useController, useFormContext } from 'react-hook-form';

import '../../ace-themes/sql_console.js';
import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { HelpFlyout } from './help_flyout';

function validateConfigurationObject(value: string) {
  try {
    JSON.parse(value.trim());
  } catch {
    return 'JSON is invalid. Enter a valid JSON';
  }
  return true;
}

export const ConfigurationPanel = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const configurationFieldController = useController({
    name: 'configuration',
    control,
    rules: {
      required: { value: true, message: 'Configuration is required.' },
      validate: validateConfigurationObject,
    },
  });

  return (
    <div>
      <EuiTitle size="s">
        <h3>Configuration</h3>
      </EuiTitle>
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
      <EuiFormRow
        style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
        label="Configuration in JSON"
        isInvalid={Boolean(configurationFieldController.fieldState.error)}
        error={configurationFieldController.fieldState.error?.message}
        labelAppend={
          <EuiButtonEmpty
            onClick={() => setIsHelpVisible(true)}
            size="xs"
            color="primary"
            data-test-subj="model-configuration-help-button"
          >
            Help
          </EuiButtonEmpty>
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
      {isHelpVisible && <HelpFlyout onClose={() => setIsHelpVisible(false)} />}
    </div>
  );
};
