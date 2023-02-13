/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
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
import { useController, useFormContext, useWatch } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { useMetricNames } from './register_model.hooks';
import { fixTwoDecimalPoint } from '../../utils';

const METRIC_VALUE_STEP = 0.01;
const MAX_METRIC_NAME_LENGTH = 50;

export const EvaluationMetricsPanel = (props: { ordinalNumber: number }) => {
  const { trigger, control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const [isRequiredValueText, setIsRequiredValueText] = useState(false);
  const [metricNamesLoading, metricNames] = useMetricNames();

  // TODO: this has to be hooked with data from BE API
  const options = useMemo(() => {
    return metricNames.map((n) => ({ label: n }));
  }, [metricNames]);

  const metricKeyController = useController({
    name: 'metric.key',
    control,
  });

  const metric = useWatch({
    control,
    name: 'metric',
  });

  const valueValidateFn = () => {
    if (metric) {
      const { trainingValue, validationValue, testingValue, key } = metric;
      if (key && !trainingValue && !validationValue && !testingValue) {
        setIsRequiredValueText(true);
        return false;
      } else {
        setIsRequiredValueText(false);
        return true;
      }
    }
    return true;
  };
  const trainingMetricFieldController = useController({
    name: 'metric.trainingValue',
    control,
    rules: {
      max: 1,
      min: 0,
      validate: valueValidateFn,
    },
  });

  const validationMetricFieldController = useController({
    name: 'metric.validationValue',
    control,
    rules: {
      max: 1,
      min: 0,
      validate: valueValidateFn,
    },
  });

  const testingMetricFieldController = useController({
    name: 'metric.testingValue',
    control,
    rules: {
      max: 1,
      min: 0,
      validate: valueValidateFn,
    },
  });

  const onMetricNameChange = useCallback(
    (data: EuiComboBoxOptionOption[]) => {
      if (data.length === 0) {
        trainingMetricFieldController.field.onChange('');
        validationMetricFieldController.field.onChange('');
        testingMetricFieldController.field.onChange('');
        metricKeyController.field.onChange('');
      } else {
        metricKeyController.field.onChange(data[0].label);
      }
    },
    [
      metricKeyController,
      trainingMetricFieldController,
      validationMetricFieldController,
      testingMetricFieldController,
    ]
  );

  const onCreateMetricName = useCallback(
    (metricName: string) => {
      if (metricName.length > MAX_METRIC_NAME_LENGTH) {
        return;
      }
      metricKeyController.field.onChange(metricName);
    },
    [metricKeyController.field]
  );

  const metricValueFields = [
    { label: 'Training value', controller: trainingMetricFieldController },
    { label: 'Validation value', controller: validationMetricFieldController },
    { label: 'Testing value', controller: testingMetricFieldController },
  ];

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // The blur could happen when selecting combo box dropdown
      // But we don't want to trigger form validation in this case
      if (
        (e.relatedTarget?.getAttribute('role') === 'option' &&
          e.relatedTarget?.tagName === 'BUTTON') ||
        e.relatedTarget?.getAttribute('role') === 'textbox'
      ) {
        return;
      }
      // Validate the form only when the current tag row blurred
      trigger('metric');
    },
    [trigger]
  );

  return (
    <div style={{ width: 475 }} onBlur={onBlur}>
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
        isInvalid={Boolean(metricKeyController.fieldState.error)}
      >
        <EuiComboBox
          fullWidth
          isLoading={metricNamesLoading}
          isInvalid={Boolean(metricKeyController.fieldState.error)}
          placeholder='Select or add a metric, like "Accuracy"'
          singleSelection={{ asPlainText: true }}
          options={options}
          selectedOptions={
            metricKeyController.field.value ? [{ label: metricKeyController.field.value }] : []
          }
          onChange={onMetricNameChange}
          onCreateOption={onCreateMetricName}
          customOptionText={`Add {searchValue} as new metric name. (${MAX_METRIC_NAME_LENGTH} characters allowed)`}
          onBlur={metricKeyController.field.onBlur}
          inputRef={metricKeyController.field.ref}
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
                disabled={!metricKeyController.field.value}
                step={METRIC_VALUE_STEP}
                name={controller.field.name}
                value={controller.field.value ?? ''}
                onChange={(value) =>
                  controller.field.onChange(fixTwoDecimalPoint(value.target.value))
                }
                onBlur={controller.field.onBlur}
                inputRef={controller.field.ref}
              />
            </EuiFormRow>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
      {isRequiredValueText && (
        <EuiText color="danger" size="xs">
          At least one value is required. Enter a value
        </EuiText>
      )}
    </div>
  );
};
