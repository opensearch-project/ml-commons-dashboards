/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  EuiPopover,
  EuiPopoverTitle,
  EuiFilterGroup,
  EuiFilterButton,
  EuiSelectable,
  EuiSelectableOption,
  EuiIcon,
} from '@elastic/eui';
import { STATUS_FILTER,type STATUS_VALUE } from '../../../common';

export interface IOption {
  value: STATUS_VALUE;
  checked: 'on' | 'off';
}
interface Props {
  options: IOption[];
  onUpdateFilters: (filters: IOption[]) => void;
}
interface IItem {
  label: string;
  checked: 'on' | 'off' | undefined;
  prepend: JSX.Element;
  value: STATUS_VALUE;
}

export const StatusFilter = ({ onUpdateFilters, options }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const items = useMemo<IItem[]>(() => {
    return options.map(item => {
      const status = STATUS_FILTER.find(option => (option.value === item.value))
      return {
        ...item,
        label:status!.label,
        prepend:  <EuiIcon type="dot" color={status!.color}/>
      }
    })
  }, [options]);

  const onButtonClick = () => {
    setIsPopoverOpen((previous) => !previous);
  };

  const onClosePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleSelectableChange = useCallback(
    (newOptions: Array<EuiSelectableOption<IItem>>) => {
      const filters = newOptions.map(({value,checked})=>({
        value,
        //when checked is off, checked of callback EuiSelectable item will be undefined
        checked: checked??'off'
      }))
      onUpdateFilters(filters);
    },
    [onUpdateFilters]
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
            onChange={handleSelectableChange}
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
