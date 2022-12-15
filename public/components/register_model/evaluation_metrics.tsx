import React, { useCallback, useMemo } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiTitle,
  EuiHorizontalRule,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
  EuiSpacer,
} from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { useMetricNames } from './register_model.hooks';

export const EvaluationMetricsPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const [metricNamesLoading, metricNames] = useMetricNames();

  // TODO: this has to be hooked with data from BE API
  const options = useMemo(() => {
    return metricNames.map((n) => ({ label: n }));
  }, [metricNames]);

  const metricFieldController = useController({
    name: 'metricName',
    control: props.formControl,
  });

  // If metric name is selected, then metric values must been set
  const validateMetricValue = useCallback(
    (value: string | undefined) => {
      if (Boolean(metricFieldController.field.value)) {
        return Boolean(value);
      }
    },
    [metricFieldController.field.value]
  );

  const trainingMetricFieldController = useController({
    name: 'trainingMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
      validate: validateMetricValue,
    },
  });

  const validationMetricFieldController = useController({
    name: 'validationMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
      validate: validateMetricValue,
    },
  });

  const testingMetricFieldController = useController({
    name: 'testingMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
      validate: validateMetricValue,
    },
  });

  const onMetricNameChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      if (data.length === 0) {
        trainingMetricFieldController.field.onChange('');
        validationMetricFieldController.field.onChange('');
        testingMetricFieldController.field.onChange('');
        metricFieldController.field.onChange('');
      } else {
        metricFieldController.field.onChange(data[0].label);
      }
    },
    [
      metricFieldController,
      trainingMetricFieldController,
      validationMetricFieldController,
      testingMetricFieldController,
    ]
  );

  const onCreateMetricName = useCallback(
    (metricName: string) => {
      metricFieldController.field.onChange(metricName);
    },
    [metricFieldController]
  );

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>Evaluation Metrics</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFormRow
        fullWidth
        label="Metric name"
        helpText="Select a metric from the list, or add a custom one."
        isInvalid={Boolean(metricFieldController.fieldState.error)}
      >
        <EuiComboBox
          isLoading={metricNamesLoading}
          placeholder="Select or add a training metric name"
          singleSelection={{ asPlainText: true }}
          options={options}
          selectedOptions={
            metricFieldController.field.value ? [{ label: metricFieldController.field.value }] : []
          }
          onChange={onMetricNameChange}
          onCreateOption={onCreateMetricName}
          customOptionText="Add {searchValue} as new metric name"
          onBlur={metricFieldController.field.onBlur}
          inputRef={metricFieldController.field.ref}
        />
      </EuiFormRow>
      <EuiSpacer />
      <EuiFlexGroup style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}>
        <EuiFlexItem>
          <EuiFormRow
            label="Training metric value"
            helpText="Enter a value between 0 and 1"
            isInvalid={Boolean(trainingMetricFieldController.fieldState.error)}
          >
            <EuiFieldNumber
              placeholder="Enter a value"
              isInvalid={Boolean(trainingMetricFieldController.fieldState.error)}
              disabled={!metricFieldController.field.value}
              step={0.1}
              name={trainingMetricFieldController.field.name}
              value={trainingMetricFieldController.field.value ?? ''}
              onChange={trainingMetricFieldController.field.onChange}
              onBlur={trainingMetricFieldController.field.onBlur}
              inputRef={trainingMetricFieldController.field.ref}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Validation metric value"
            helpText="Enter a value between 0 and 1"
            isInvalid={Boolean(validationMetricFieldController.fieldState.error)}
          >
            <EuiFieldNumber
              placeholder="Enter a value"
              isInvalid={Boolean(validationMetricFieldController.fieldState.error)}
              disabled={!metricFieldController.field.value}
              step={0.1}
              name={validationMetricFieldController.field.name}
              value={validationMetricFieldController.field.value ?? ''}
              onChange={validationMetricFieldController.field.onChange}
              onBlur={validationMetricFieldController.field.onBlur}
              inputRef={validationMetricFieldController.field.ref}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Testing metric value"
            helpText="Enter a value between 0 and 1"
            isInvalid={Boolean(testingMetricFieldController.fieldState.error)}
          >
            <EuiFieldNumber
              placeholder="Enter a value"
              isInvalid={Boolean(testingMetricFieldController.fieldState.error)}
              disabled={!metricFieldController.field.value}
              step={0.1}
              name={testingMetricFieldController.field.name}
              value={testingMetricFieldController.field.value ?? ''}
              onChange={testingMetricFieldController.field.onChange}
              onBlur={testingMetricFieldController.field.onBlur}
              inputRef={testingMetricFieldController.field.ref}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
