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
  EuiIcon,
} from '@elastic/eui';
import { STATUS_FILTER } from '../../../common';

interface Props {
  onUpdateFilters: (filters: string[]) => void;
}

export const StatusFilter = ({ onUpdateFilters }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [items, setItems] = useState(
    STATUS_FILTER.map((item) => ({
      label: item.label,
      checked: 'on' as 'on' | 'off', // match eui mismatch type
      prepend: <EuiIcon type="dot" color={item.color} />,
    }))
  );

  const handleUpdateFilters = useCallback(() => {
    const selectedItems = items.filter((item) => item.checked === 'on').map((item) => item.label);
    onUpdateFilters(selectedItems);
  }, [items, onUpdateFilters]);

  const onButtonClick = useCallback(() => {
    if (isPopoverOpen) {
      // should close popover and update filters
      handleUpdateFilters();
    }
    setIsPopoverOpen(!isPopoverOpen);
  }, [isPopoverOpen]);

  const onClosePopover = () => {
    setIsPopoverOpen(false);
    handleUpdateFilters();
  };

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
            onChange={(newOptions) => setItems(newOptions)}
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
