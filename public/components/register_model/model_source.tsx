/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import {
  EuiSpacer,
  EuiText,
  EuiComboBoxOptionOption,
  EuiLink,
  EuiFormRow,
  EuiComboBox,
} from '@elastic/eui';

import { useController, useFormContext } from 'react-hook-form';
import { useMonitoring } from '../monitoring/use_monitoring';

export const ModelSource = () => {
  const { allExternalConnectors } = useMonitoring();
  const connectorOptions = allExternalConnectors?.map((item) => {
    return Object.assign({}, { label: item.name, value: item.id });
  });
  const { control } = useFormContext<{ modelConnector: string }>();

  const modelConnectorController = useController({
    name: 'modelConnector',
    control,
    rules: {
      required: {
        value: true,
        message: '',
      },
    },
  });
  const { ref: fileFormatInputRef, ...fileFormatField } = modelConnectorController.field;
  const selectedConnectorOption = useMemo(() => {
    if (fileFormatField.value) {
      return connectorOptions?.find((connector) => connector.value === fileFormatField.value);
    }
  }, [fileFormatField, connectorOptions]);

  const onConnectorChange = useCallback(
    (options: Array<EuiComboBoxOptionOption<string>>) => {
      const value = options[0]?.value;
      fileFormatField.onChange(value);
    },
    [fileFormatField]
  );
  return (
    <div>
      <EuiText size="s">
        <h3>Model source</h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          External model source explained, connector provisioning, etc.{' '}
          <EuiLink external href="#">
            Learn more
          </EuiLink>
          .
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFormRow label="Model connector">
        <EuiComboBox
          inputRef={fileFormatInputRef}
          options={connectorOptions}
          singleSelection={{ asPlainText: true }}
          selectedOptions={selectedConnectorOption ? [selectedConnectorOption] : []}
          placeholder="Select a connector"
          onChange={onConnectorChange}
        />
      </EuiFormRow>
    </div>
  );
};
