/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { EuiButton, EuiSpacer, EuiText } from '@elastic/eui';
import { Tag } from '../../../model/types';
import { TagField, TagGroup } from './tag_field';

interface Props {
  tags: TagGroup[];
  readOnly?: boolean;
  allowKeyCreate?: boolean;
  maxTagNum?: number;
}

export const ModelTagArrayField = ({
  tags,
  readOnly = false,
  allowKeyCreate = true,
  maxTagNum = 10,
}: Props) => {
  const { control } = useFormContext<{ tags?: Tag[] }>();
  const { fields, append, remove } = useFieldArray({
    name: 'tags',
    control,
  });

  const addNewTag = useCallback(() => {
    append({ key: '', value: '', type: 'string' });
  }, [append]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <TagField
            key={field.id}
            index={index}
            tagGroups={tags}
            onDelete={remove}
            allowKeyCreate={allowKeyCreate}
            readOnly={readOnly}
          />
        );
      })}
      <EuiSpacer />
      {!readOnly && (
        <>
          <EuiButton
            style={{ width: 130 }}
            disabled={fields.length >= maxTagNum}
            onClick={addNewTag}
          >
            Add tag
          </EuiButton>
          <EuiSpacer size="xs" />
          <EuiText color="subdued">
            <small>{`You can add up to ${maxTagNum - fields.length} more tags.`}</small>
          </EuiText>
        </>
      )}
    </>
  );
};
