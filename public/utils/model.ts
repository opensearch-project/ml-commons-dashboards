/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelSearchItem } from '../apis/model';

export interface VersionList
  extends Array<{
    version: string;
    id: string;
    //oui select props
    value: string;
    text: string;
  }> {}

export const generateVersionList: (data: ModelSearchItem[]) => VersionList = (data) => {
  return data.map(({ version, id }: ModelSearchItem) => ({
    version,
    id,
    value: id,
    text: version,
  }));
};
