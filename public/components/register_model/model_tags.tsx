/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiButton, EuiPanel, EuiTitle, EuiHorizontalRule, EuiSpacer } from '@elastic/eui';
import { useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ModelTagField } from './tag_field';
import { useModelTags } from './register_model.hooks';

export const ModelTagsPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const [, { keys, values }] = useModelTags();
  const { fields, append, remove } = useFieldArray({
    name: 'tags',
    control: props.formControl,
  });

  const addNewTag = useCallback(() => {
    append({ key: '', value: '' });
  }, []);

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          Tags - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      {fields.map((field, index) => {
        return (
          <ModelTagField
            key={field.id}
            name="tags"
            index={index}
            formControl={props.formControl}
            tagKeys={keys}
            tagValues={values}
            onDelete={remove}
          />
        );
      })}
      <EuiSpacer />
      <EuiButton onClick={addNewTag}>Add new tag</EuiButton>
    </EuiPanel>
  );
};
