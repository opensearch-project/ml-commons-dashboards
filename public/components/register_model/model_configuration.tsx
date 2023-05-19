/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiFormRow,
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
import { ErrorMessage } from './error_message';
import { CUSTOM_FORM_ERROR_TYPES } from '../common/forms/form_constants';

function validateConfigurationObject(value: string) {
  try {
    JSON.parse(value.trim());
  } catch {
    return 'JSON is invalid. Enter a valid JSON';
  }
  return true;
}

function validateModelType(value: string) {
  try {
    const config = JSON.parse(value.trim());
    if (!('model_type' in config)) {
      return 'model_type is required. Specify the model_type';
    }
  } catch {
    return true;
  }
  return true;
}

function validateModelTypeValue(value: string) {
  try {
    const config = JSON.parse(value.trim());
    if ('model_type' in config && typeof config.model_type !== 'string') {
      return 'model_type must be a string';
    }
  } catch {
    return true;
  }
  return true;
}

function validateEmbeddingDimensionValue(value: string) {
  try {
    const config = JSON.parse(value.trim());
    if ('embedding_dimension' in config && typeof config.embedding_dimension !== 'number') {
      return 'embedding_dimension must be a number';
    }
  } catch {
    return true;
  }

  return true;
}

function validateFrameworkTypeValue(value: string) {
  try {
    const config = JSON.parse(value.trim());
    if ('framework_type' in config && typeof config.framework_type !== 'string') {
      return 'framework_type must be a string';
    }
  } catch {
    return true;
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
      validate: {
        [CUSTOM_FORM_ERROR_TYPES.INVALID_CONFIGURATION]: validateConfigurationObject,
        [CUSTOM_FORM_ERROR_TYPES.CONFIGURATION_MISSING_MODEL_TYPE]: validateModelType,
        [CUSTOM_FORM_ERROR_TYPES.INVALID_MODEL_TYPE_VALUE]: validateModelTypeValue,
        [CUSTOM_FORM_ERROR_TYPES.INVALID_EMBEDDING_DIMENSION_VALUE]: validateEmbeddingDimensionValue,
        [CUSTOM_FORM_ERROR_TYPES.INVALID_FRAMEWORK_TYPE_VALUE]: validateFrameworkTypeValue,
      },
    },
  });

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
      <EuiFormRow
        style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
        label="Configuration in JSON"
        isInvalid={Boolean(configurationFieldController.fieldState.error)}
        error={<ErrorMessage error={configurationFieldController.fieldState.error} />}
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
