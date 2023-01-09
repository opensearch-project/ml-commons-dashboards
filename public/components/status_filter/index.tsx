/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  EuiPopover,
  EuiPopoverTitle,
  EuiFilterGroup,
  EuiFilterButton,
  EuiSelectable,
  EuiSelectableOption,
  EuiIcon,
} from '@elastic/eui';
import { STATUS_FILTER } from '../../../common';

interface Props {
  onUpdateFilters: (filters: string[]) => void;
}
interface IItem {
  label: string;
  checked: 'on' | 'off';
  prepend: JSX.Element;
  value: string;
}

export const StatusFilter = ({ onUpdateFilters }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [items, setItems] = useState<IItem[]>(
    STATUS_FILTER.map((item) => ({
      label: item.label,
      checked: 'on' as 'on' | 'off', // match eui mismatch type
      prepend: <EuiIcon type="dot" color={item.color} />,
      value: item.value,
    }))
  );

  const onButtonClick = useCallback(() => {
    setIsPopoverOpen(!isPopoverOpen);
  }, [isPopoverOpen]);

  const onClosePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleSelectableChange = useCallback(
    (newOptions: Array<EuiSelectableOption<IItem>>) => {
      const selectedItems = newOptions
        .filter((item) => item.checked === 'on')
        .map((item) => item.value);
      onUpdateFilters(selectedItems);
      setItems(newOptions);
    },
    [onUpdateFilters, setItems]
  );

  const button = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={onButtonClick}
      isSelected={isPopoverOpen}
      numFilters={items.filter((item) => item.checked !== 'off').length}
      hasActiveFilters={!!items.find((item) => item.checked === 'on')}
      numActiveFilters={items.filter((item) => item.checked === 'on').length}
    >
      Status
    </EuiFilterButton>
  );

  return (
    <>
      <EuiFilterGroup>
        <EuiPopover
          id="ml-commons-status-filter"
          button={button}
          isOpen={isPopoverOpen}
          closePopover={onClosePopover}
          panelPaddingSize="none"
        >
          <EuiSelectable
            searchable
            searchProps={{
              placeholder: 'Search',
              compressed: true,
            }}
            aria-label="Status"
            options={items}
            onChange={(newOptions) => handleSelectableChange(newOptions)}
            isLoading={false}
            emptyMessage="No filters available"
            noMatchesMessage="No filters found"
            listProps={{ onFocusBadge: false }}
          >
            {(list, search) => {
              return (
                <div style={{ width: 300 }}>
                  <EuiPopoverTitle paddingSize="s">{search}</EuiPopoverTitle>
                  {list}
                </div>
              );
            }}
          </EuiSelectable>
        </EuiPopover>
      </EuiFilterGroup>
    </>
  );
};
