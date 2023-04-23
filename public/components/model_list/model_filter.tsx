/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  EuiPopover,
  EuiPopoverTitle,
  EuiFieldSearch,
  EuiFilterButton,
  EuiPopoverFooter,
} from '@elastic/eui';
import { ModelFilterItem } from './model_filter_item';

export interface ModelFilterProps {
  name: string;
  searchPlaceholder: string;
  options: Array<string | { name: string; value: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  footer?: React.ReactNode;
}

export const ModelFilter = ({
  name,
  value,
  footer,
  options,
  searchPlaceholder,
  onChange,
}: ModelFilterProps) => {
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>();

  const filteredOptions = useMemo(
    () =>
      searchText
        ? options.filter((option) =>
            (typeof option === 'string' ? option : option.name)
              .toLowerCase()
              .includes(searchText.toLowerCase())
          )
        : options,
    [searchText, options]
  );

  const handleButtonClick = useCallback(() => {
    setIsPopoverOpen((prevState) => !prevState);
  }, []);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleFilterItemClick = useCallback((clickItemValue: string) => {
    onChangeRef.current(
      valueRef.current.includes(clickItemValue)
        ? valueRef.current.filter((item) => item !== clickItemValue)
        : valueRef.current.concat(clickItemValue)
    );
  }, []);

  return (
    <EuiPopover
      id="popoverExampleMultiSelect"
      button={
        <EuiFilterButton
          iconType="arrowDown"
          onClick={handleButtonClick}
          isSelected={isPopoverOpen}
          numFilters={options.length}
          hasActiveFilters={value.length > 0}
          numActiveFilters={value.length}
        >
          {name}
        </EuiFilterButton>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
    >
      <EuiPopoverTitle paddingSize="s">
        <EuiFieldSearch compressed placeholder={searchPlaceholder} onSearch={setSearchText} />
      </EuiPopoverTitle>
      {filteredOptions.map((item, index) => {
        const itemValue = typeof item === 'string' ? item : item.value;
        const checked = value.includes(itemValue) ? 'on' : undefined;
        return (
          <ModelFilterItem
            onClick={handleFilterItemClick}
            checked={checked}
            value={itemValue}
            key={index}
          >
            {typeof item === 'string' ? item : item.name}
          </ModelFilterItem>
        );
      })}
      {footer && <EuiPopoverFooter>{footer}</EuiPopoverFooter>}
    </EuiPopover>
  );
};
