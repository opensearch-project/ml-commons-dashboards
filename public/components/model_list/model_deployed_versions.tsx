/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { bus } from './bus';
const DISPLAY_VERSION = 3;

export const ModelDeployedVersions = ({ versions }: { versions: string[] }) => {
  function sendVersions() {
    bus.emit('sendVersions', versions);
  }
  sendVersions();
  if (versions.length === 0) {
    return <span>-</span>;
  }
  const appendMore = versions.length > DISPLAY_VERSION;

  return (
    <span style={{ color: '#343741', fontSize: 14 }}>
      <span style={{ fontWeight: 700 }}>
        {versions.slice(0, DISPLAY_VERSION).join(', ')}
        {appendMore ? ', ' : ''}
      </span>
      {appendMore && (
        <span style={{ fontStyle: 'italic' }}>+ {versions.length - DISPLAY_VERSION} more</span>
      )}
    </span>
  );
};
