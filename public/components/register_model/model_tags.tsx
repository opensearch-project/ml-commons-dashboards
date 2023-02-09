/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiButton, EuiTitle, EuiHorizontalRule, EuiSpacer, EuiText } from '@elastic/eui';
import { useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ModelTagField } from './tag_field';
import { useModelTags } from './register_model.hooks';

const MAX_TAG_NUM = 25;

export const ModelTagsPanel = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
  ordinalNumber: number;
}) => {
  const [, { keys, values }] = useModelTags();
  const { fields, append, remove } = useFieldArray({
    name: 'tags',
    control: props.formControl,
  });

  const addNewTag = useCallback(() => {
    append({ key: '', value: '' });
  }, [append]);

  return (
    <div>
      <EuiTitle size="s">
        <h3>
          {props.ordinalNumber}. Tags - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      {fields.map((field, index) => {
        return (
          <ModelTagField
            key={field.id}
            index={index}
            formControl={props.formControl}
            tagKeys={keys}
            tagValues={values}
            onDelete={remove}
          />
        );
      })}
      <EuiSpacer />
      {fields.length < MAX_TAG_NUM && <EuiButton onClick={addNewTag}>Add new tag</EuiButton>}
      <EuiSpacer size="xs" />
      <EuiText color="subdued">
        <small>{`You can add up to ${MAX_TAG_NUM - fields.length} more tags.`}</small>
      </EuiText>
    </div>
  );
};
