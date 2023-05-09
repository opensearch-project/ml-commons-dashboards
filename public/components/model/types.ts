/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../common';

export interface VersionTableDataItem {
  id: string;
  name: string;
  version: string;
  state: MODEL_STATE;
  lastUpdated: number;
  tags: { [key: string]: string | number };
  createdTime: number;
}
