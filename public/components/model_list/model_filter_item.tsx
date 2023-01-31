/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiFilterSelectItem, EuiFilterSelectItemProps } from '@elastic/eui';

export interface ModelFilterItemProps
  extends Pick<EuiFilterSelectItemProps, 'checked' | 'children'> {
  value: string;
  onClick: (value: string) => void;
}

export const ModelFilterItem = ({ checked, children, onClick, value }: ModelFilterItemProps) => {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);
  return (
    <EuiFilterSelectItem checked={checked} onClick={handleClick}>
      {children}
    </EuiFilterSelectItem>
  );
};
