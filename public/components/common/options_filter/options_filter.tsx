/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  EuiPopover,
  EuiPopoverTitle,
  EuiFieldSearch,
  EuiSmallFilterButton,
  EuiPopoverFooter,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { OptionsFilterItem } from './options_filter_item';

export interface OptionsFilterProps<T extends string | number = string> {
  id?: string;
  name: string;
  searchPlaceholder: string;
  searchWidth?: number;
  options: Array<T | { name: string; value: T; prepend?: React.ReactNode }>;
  value: T[];
  onChange: (value: T[]) => void;
  footer?: React.ReactNode;
}

export const OptionsFilter = <T extends string | number = string>({
  name,
  value,
  footer,
  options,
  searchPlaceholder,
  searchWidth,
  onChange,
  ...restProps
}: OptionsFilterProps<T>) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>();

  const filteredOptions = useMemo(
    () =>
      searchText
        ? options.filter((option) =>
            (typeof option === 'object' ? option.name : option.toString())
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

  const handleFilterItemClick = useCallback(
    (clickItemValue: T) => {
      onChange(
        value.includes(clickItemValue)
          ? value.filter((item) => item !== clickItemValue)
          : value.concat(clickItemValue)
      );
    },
    [value, onChange]
  );

  return (
    <EuiPopover
      button={
        <EuiSmallFilterButton
          iconType="arrowDown"
          onClick={handleButtonClick}
          isSelected={isPopoverOpen}
          {...(value.length > 0 ? { hasActiveFilters: true, numActiveFilters: value.length } : {})}
        >
          {name}
        </EuiSmallFilterButton>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      {...restProps}
    >
      <EuiPopoverTitle style={{ padding: 12 }}>
        <EuiFieldSearch
          compressed
          placeholder={searchPlaceholder}
          onSearch={setSearchText}
          style={typeof searchWidth !== 'undefined' ? { width: searchWidth } : {}}
        />
      </EuiPopoverTitle>
      {filteredOptions.map((item, index) => {
        const itemValue = typeof item === 'object' ? item.value : item;
        const checked = value.includes(itemValue) ? 'on' : undefined;
        return (
          <OptionsFilterItem
            onClick={handleFilterItemClick}
            checked={checked}
            value={itemValue}
            key={`${index}${itemValue}`}
          >
            {typeof item === 'object' ? (
              <EuiFlexGroup alignItems="center" gutterSize="s">
                {item.prepend && <EuiFlexItem grow={false}>{item.prepend}</EuiFlexItem>}
                <EuiFlexItem>{item.name}</EuiFlexItem>
              </EuiFlexGroup>
            ) : (
              item
            )}
          </OptionsFilterItem>
        );
      })}
      {footer && <EuiPopoverFooter>{footer}</EuiPopoverFooter>}
    </EuiPopover>
  );
};
