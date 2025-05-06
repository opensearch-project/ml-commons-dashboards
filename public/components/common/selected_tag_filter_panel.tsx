/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiBadge, EuiTextColor, EuiPopover } from '@elastic/eui';

import {
  TagFilterValue,
  TagFilterOperator,
  TagFilterPopoverContent,
  TagFilterPopoverContentProps,
} from './tag_filter_popover_content';

const generateFilterLabel = (tag: TagFilterValue) => {
  const texts = [tag.name];
  texts.push(
    ({
      [TagFilterOperator.IsLessThan]: ' < ',
      [TagFilterOperator.IsGreaterThan]: ' > ',
      [TagFilterOperator.IsOneOf]: ' is one of ',
      [TagFilterOperator.IsNotOneOf]: ' is one of ',
    } as Record<TagFilterOperator, string>)[tag.operator] || ': '
  );
  const text = `${texts.join('')}${
    Array.isArray(tag.value) ? `${tag.value.join(', ')}` : tag.value
  }`;

  return tag.operator === TagFilterOperator.IsNot ||
    tag.operator === TagFilterOperator.IsNotOneOf ? (
    <>
      <EuiTextColor color="danger">{'NOT '}</EuiTextColor>
      <EuiTextColor color="default">{text}</EuiTextColor>
    </>
  ) : (
    text
  );
};

interface SelectedTagFilterItemProps extends Pick<TagFilterPopoverContentProps, 'tagKeys'> {
  filter: TagFilterValue;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, newValue: TagFilterValue) => void;
}

const SelectedTagFilterItem = ({
  filter,
  tagKeys,
  index,
  onRemove,
  onChange,
}: SelectedTagFilterItemProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleClose = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleClick = useCallback(() => {
    setIsPopoverOpen((prev) => !prev);
  }, []);

  const handleSave = useCallback(
    (newValue: TagFilterValue) => {
      closePopover();
      onChange(index, newValue);
    },
    [closePopover, onChange, index]
  );

  return (
    <EuiFlexItem grow={false}>
      <EuiPopover
        button={
          <EuiBadge
            color="hollow"
            iconType="cross"
            iconSide="right"
            iconOnClick={handleClose}
            iconOnClickAriaLabel="Remove filter"
            data-test-subj="filterBadge"
            onClick={handleClick}
            onClickAriaLabel="Edit filter"
            style={{
              paddingBottom: 6,
              paddingTop: 6,
              ...(filter.operator === TagFilterOperator.IsNot ||
              filter.operator === TagFilterOperator.IsNotOneOf
                ? {
                    borderColor: 'rgb(235, 190, 188)',
                  }
                : {}),
            }}
          >
            {generateFilterLabel(filter)}
          </EuiBadge>
        }
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        initialFocus={false}
      >
        <TagFilterPopoverContent
          tagKeys={tagKeys}
          tagFilter={filter}
          onCancel={closePopover}
          onSave={handleSave}
        />
      </EuiPopover>
    </EuiFlexItem>
  );
};

interface SelectedTagFiltersPanelProps extends Pick<TagFilterPopoverContentProps, 'tagKeys'> {
  tagFilters: TagFilterValue[];
  onTagFiltersChange: (newFilters: TagFilterValue[]) => void;
}

export const SelectedTagFiltersPanel = ({
  tagKeys,
  tagFilters,
  onTagFiltersChange,
}: SelectedTagFiltersPanelProps) => {
  const handleChange = useCallback(
    (index: number, newFilterValue: TagFilterValue) => {
      onTagFiltersChange([
        ...tagFilters.slice(0, index),
        newFilterValue,
        ...tagFilters.slice(index + 1),
      ]);
    },
    [tagFilters, onTagFiltersChange]
  );
  const handleRemove = useCallback(
    (index: number) => {
      onTagFiltersChange([...tagFilters.slice(0, index), ...tagFilters.slice(index + 1)]);
    },
    [tagFilters, onTagFiltersChange]
  );
  return (
    <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false} style={{ minHeight: 32 }}>
      {tagFilters.map((tagFilter, index) => (
        <SelectedTagFilterItem
          filter={tagFilter}
          index={index}
          onChange={handleChange}
          onRemove={handleRemove}
          tagKeys={tagKeys}
          key={`${tagFilter.name}${tagFilter.operator}${tagFilter.value.toString()}${index}`}
        />
      ))}
    </EuiFlexGroup>
  );
};
