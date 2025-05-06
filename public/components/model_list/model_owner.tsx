/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiAvatar, EuiToolTip } from '@elastic/eui';

export function ModelOwner({ name }: { name: string }) {
  return (
    <EuiToolTip position="right" content={name}>
      <EuiAvatar size="m" name={name} color="#6DCCB1" />
    </EuiToolTip>
  );
}
