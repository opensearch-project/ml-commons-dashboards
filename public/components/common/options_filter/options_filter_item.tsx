/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiFilterSelectItem, EuiFilterSelectItemProps } from '@elastic/eui';

export interface OptionsFilterItemProps<T extends string | number>
  extends Pick<EuiFilterSelectItemProps, 'checked' | 'children'> {
  value: T;
  onClick: (value: T) => void;
}

export const OptionsFilterItem = <T extends string | number>({
  checked,
  children,
  onClick,
  value,
}: OptionsFilterItemProps<T>) => {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);
  return (
    <EuiFilterSelectItem checked={checked} onClick={handleClick}>
      {children}
    </EuiFilterSelectItem>
  );
};
