/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiHealth } from '@elastic/eui';

import { MODEL_VERSION_STATE } from '../../../../common';

const state2StatusContentMap: { [key in MODEL_VERSION_STATE]?: [string, string] } = {
  [MODEL_VERSION_STATE.registering]: ['#AFB0B3', 'In progress...'],
  [MODEL_VERSION_STATE.deploying]: ['#AFB0B3', 'In progress...'],
  [MODEL_VERSION_STATE.registered]: ['success', 'Success'],
  [MODEL_VERSION_STATE.deployed]: ['success', 'Success'],
  [MODEL_VERSION_STATE.undeployed]: ['success', 'Success'],
  [MODEL_VERSION_STATE.deployFailed]: ['danger', 'Error'],
  [MODEL_VERSION_STATE.registerFailed]: ['danger', 'Error'],
  [MODEL_VERSION_STATE.partiallyDeployed]: ['warning', 'Warning'],
};

export const ModelVersionStatusCell = ({ state }: { state: MODEL_VERSION_STATE }) => {
  const statusContent = state2StatusContentMap[state];
  if (!statusContent) {
    return <>-</>;
  }
  const [color, text] = statusContent;
  return <EuiHealth color={color}>{text}</EuiHealth>;
};
