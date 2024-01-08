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

import { useFetcher } from '../../hooks';
import { APIProvider } from '../../apis/api_provider';
import { ExternalModelFormData } from './register_model.types';

export const ModelSource = () => {
  const { data: allConnectorsData } = useFetcher(APIProvider.getAPI('connector').getAll);
  const connectorOptions = useMemo(
    () =>
      allConnectorsData?.data?.map((item) => {
        return Object.assign({}, { label: item.name, value: item.id });
      }),
    [allConnectorsData]
  );
  const { control } = useFormContext<ExternalModelFormData>();

  const modelConnectorController = useController({
    name: 'connectorId',
    control,
    rules: {
      required: {
        value: true,
        message: 'Model connector is required',
      },
    },
  });
  const { ref: connectorInputRef, ...fileFormatField } = modelConnectorController.field;
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
          inputRef={connectorInputRef}
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
