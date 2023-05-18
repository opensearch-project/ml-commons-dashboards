/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiComboBoxOptionOption, EuiText, EuiToken } from '@elastic/eui';

export const MAX_TAG_LENGTH = 80;

export const tagKeyTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
];

export type TagKeyType = 'string' | 'number';

export interface TagKey {
  name: string;
  type: TagKeyType;
}

export const tagKeyOptionRenderer = (
  option: EuiComboBoxOptionOption<TagKey>,
  _searchValue: string,
  contentClassName: string
) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <EuiToken
        style={{ marginRight: 2 }}
        iconType={option.value?.type === 'number' ? 'tokenNumber' : 'tokenString'}
      />
      <span className={contentClassName}>{option.label}</span>
      <EuiText style={{ marginLeft: 'auto' }} color="subdued" size="s">
        {tagKeyTypeOptions.find((item) => item.value === option.value?.type)?.label}
      </EuiText>
    </div>
  );
};
