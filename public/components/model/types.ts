/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_VERSION_STATE } from '../../../common';
import { TagKey } from '../common';

export interface VersionTableDataItem {
  id: string;
  name: string;
  version: string;
  state: MODEL_VERSION_STATE;
  lastUpdatedTime: number;
  tags: { [key: string]: string | number };
  createdTime: number;
  lastRegisteredTime?: number;
  lastDeployedTime?: number;
  lastUndeployedTime?: number;
}

export interface Tag {
  key: string;
  value: string;
  type: 'number' | 'string';
}

export interface TagKeyFormData {
  tagKeys: TagKey[];
}
