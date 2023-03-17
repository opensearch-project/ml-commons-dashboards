/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiButton, EuiSpacer, EuiText, EuiLink } from '@elastic/eui';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { ModelTagField } from './tag_field';
import { useModelTags } from './register_model.hooks';

const MAX_TAG_NUM = 10;

export const ModelTagsPanel = () => {
  const { control } = useFormContext<ModelFileFormData | ModelUrlFormData>();
  const { id: latestVersionId } = useParams<{ id: string | undefined }>();
  const [, { keys, values }] = useModelTags();
  const { fields, append, remove } = useFieldArray({
    name: 'tags',
    control,
  });
  const isRegisterNewVersion = !!latestVersionId;
  const maxTagNum = isRegisterNewVersion ? keys.length : MAX_TAG_NUM;

  const addNewTag = useCallback(() => {
    append({ key: '', value: '' });
  }, [append]);

  return (
    <div>
      <EuiText size="s">
        <h3>
          Tags - <i style={{ fontWeight: 300 }}>optional</i>
        </h3>
      </EuiText>
      <EuiText style={{ maxWidth: 725 }}>
        <small>
          {isRegisterNewVersion ? (
            <>
              Add tags to help your organization discover and compare models, and track information
              related to new versions of this model, such as evaluation metrics.
            </>
          ) : (
            <>
              Add tags to help your organization discover, compare, and track information related to
              your model. The tag keys used here will define the available keys for all versions of
              this model.{' '}
              <EuiLink external href="#">
                Learn more
              </EuiLink>
              .
            </>
          )}
        </small>
      </EuiText>
      <EuiSpacer size="m" />
      {fields.map((field, index) => {
        return (
          <ModelTagField
            key={field.id}
            index={index}
            tagKeys={keys}
            tagValues={values}
            onDelete={remove}
            allowKeyCreate={!latestVersionId}
          />
        );
      })}
      <EuiSpacer />
      <EuiButton disabled={fields.length >= maxTagNum} onClick={addNewTag}>
        Add new tag
      </EuiButton>
      <EuiSpacer size="xs" />
      <EuiText color="subdued">
        <small>{`You can add up to ${maxTagNum - fields.length} more tags.`}</small>
      </EuiText>
    </div>
  );
};
