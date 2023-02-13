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
  EuiButtonEmpty,
  EuiSpacer,
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

export const ConfigurationPanel = (props: { ordinalNumber: number }) => {
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
        <h3>{props.ordinalNumber}. Configuration</h3>
      </EuiTitle>
      <EuiText style={{ maxWidth: 450 }}>
        <small>
          The model configuration JSON object.{' '}
          <EuiButtonEmpty
            onClick={() => setIsHelpVisible(true)}
            size="xs"
            color="primary"
            data-test-subj="model-configuration-help-button"
          >
            Help.
          </EuiButtonEmpty>
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFormRow
        style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
        label="Configuration in JSON"
        isInvalid={Boolean(configurationFieldController.fieldState.error)}
        error={configurationFieldController.fieldState.error?.message}
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
