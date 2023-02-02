/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiFormRow,
  EuiTitle,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { useMetricNames } from './register_model.hooks';

const METRIC_VALUE_STEP = 0.01;

export const EvaluationMetricsPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
  ordinalNumber: number;
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

  const trainingMetricFieldController = useController({
    name: 'trainingMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
    },
  });

  const validationMetricFieldController = useController({
    name: 'validationMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
    },
  });

  const testingMetricFieldController = useController({
    name: 'testingMetricValue',
    control: props.formControl,
    rules: {
      max: 1,
      min: 0,
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

  const metricValueFields = [
    { label: 'Training value', controller: trainingMetricFieldController },
    { label: 'Validation value', controller: validationMetricFieldController },
    { label: 'Testing value', controller: testingMetricFieldController },
  ];

  return (
    <div style={{ width: 475 }}>
      <EuiTitle size="s">
        <h3>
          {props.ordinalNumber}. Evaluation Metrics - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiTitle>
      <EuiText>
        <small>
          Track training, validation, and testing metrics to compare across versions and models.
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFormRow
        fullWidth
        label="Metric"
        isInvalid={Boolean(metricFieldController.fieldState.error)}
      >
        <EuiComboBox
          fullWidth
          isLoading={metricNamesLoading}
          placeholder='Select or add a metric, like "Accuracy"'
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
      <EuiFlexGroup>
        {metricValueFields.map(({ label, controller }) => (
          <EuiFlexItem key={controller.field.name}>
            <EuiFormRow
              label={label}
              helpText="Enter a value from 0 to 1"
              isInvalid={Boolean(controller.fieldState.error)}
            >
              <EuiFieldNumber
                placeholder="Enter a value"
                isInvalid={Boolean(controller.fieldState.error)}
                disabled={!metricFieldController.field.value}
                step={METRIC_VALUE_STEP}
                name={controller.field.name}
                value={controller.field.value ?? ''}
                onChange={controller.field.onChange}
                onBlur={controller.field.onBlur}
                inputRef={controller.field.ref}
              />
            </EuiFormRow>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </div>
  );
};
