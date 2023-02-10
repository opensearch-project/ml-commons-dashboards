/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiButton, EuiTitle, EuiHorizontalRule, EuiSpacer, EuiText } from '@elastic/eui';
import { useFieldArray, useFormContext } from 'react-hook-form';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ModelTagField } from './tag_field';
import { useModelTags } from './register_model.hooks';

const MAX_TAG_NUM = 25;

export const ModelTagsPanel = (props: { ordinalNumber: number }) => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const [, { keys, values }] = useModelTags();
  const { fields, append, remove } = useFieldArray({
    name: 'tags',
    control,
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
            tagKeys={keys}
            tagValues={values}
            onDelete={remove}
          />
        );
      })}
      <EuiSpacer />
      <EuiButton disabled={fields.length >= MAX_TAG_NUM} onClick={addNewTag}>
        Add new tag
      </EuiButton>
      <EuiSpacer size="xs" />
      <EuiText color="subdued">
        <small>{`You can add up to ${MAX_TAG_NUM - fields.length} more tags.`}</small>
      </EuiText>
    </div>
  );
};
