/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiFilterSelectItem, EuiFilterSelectItemProps } from '@elastic/eui';

export interface OptionsFilterItemProps
  extends Pick<EuiFilterSelectItemProps, 'checked' | 'children'> {
  value: string;
  onClick: (value: string) => void;
}

export const OptionsFilterItem = ({
  checked,
  children,
  onClick,
  value,
}: OptionsFilterItemProps) => {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);
  return (
    <EuiFilterSelectItem checked={checked} onClick={handleClick}>
      {children}
    </EuiFilterSelectItem>
  );
};
