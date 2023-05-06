/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiHealth } from '@elastic/eui';

import { MODEL_STATE } from '../../../../common';

const state2StatusContentMap: { [key in MODEL_STATE]?: [string, string] } = {
  [MODEL_STATE.uploading]: ['#AFB0B3', 'In progress...'],
  [MODEL_STATE.loading]: ['#AFB0B3', 'In progress...'],
  [MODEL_STATE.uploaded]: ['success', 'Success'],
  [MODEL_STATE.loaded]: ['success', 'Success'],
  [MODEL_STATE.unloaded]: ['success', 'Success'],
  [MODEL_STATE.loadFailed]: ['danger', 'Error'],
  [MODEL_STATE.registerFailed]: ['danger', 'Error'],
  [MODEL_STATE.partiallyLoaded]: ['warning', 'Warning'],
};

export const ModelGroupVersionStatusCell = ({ state }: { state: MODEL_STATE }) => {
  const statusContent = state2StatusContentMap[state];
  if (!statusContent) {
    return <>-</>;
  }
  const [color, text] = statusContent;
  return <EuiHealth color={color}>{text}</EuiHealth>;
};
