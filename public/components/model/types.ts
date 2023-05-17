/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';
import { TagKey } from '../common';

export interface VersionTableDataItem {
  id: string;
  name: string;
  version: string;
  state: MODEL_STATE;
  lastUpdatedTime: number;
  tags: { [key: string]: string | number };
  createdTime: number;
}

export interface Tag {
  key: string;
  value: string;
  type: 'number' | 'string';
}

export interface TagKeyFormData {
  tagKeys: TagKey[];
}
