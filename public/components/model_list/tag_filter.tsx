/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { EuiFilterButton, EuiIcon, EuiLoadingChart, EuiPopover, EuiSpacer } from '@elastic/eui';

import { TagFilterPopoverContent, TagFilterValue, TagFilterPopoverContentProps } from '../common';

interface TagFilterProps extends Pick<TagFilterPopoverContentProps, 'tagKeys'> {
  tagKeysLoading: boolean;
  value: TagFilterValue[];
  onChange: (value: TagFilterValue[]) => void;
}

export const TagFilter = ({ value, onChange, tagKeys, tagKeysLoading }: TagFilterProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const closePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleFilterButtonClick = useCallback(() => {
    setIsPopoverOpen((prevOpenState) => !prevOpenState);
  }, []);

  const handleSave = useCallback(
    (tagFilter) => {
      onChange([...value, tagFilter]);
      closePopover();
    },
    [value, onChange, closePopover]
  );

  return (
    <EuiPopover
      button={
        <EuiFilterButton
          iconType="arrowDown"
          {...(value.length > 0 ? { hasActiveFilters: true, numActiveFilters: value.length } : {})}
          onClick={handleFilterButtonClick}
        >
          Tags
        </EuiFilterButton>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      initialFocus={false}
    >
      {!tagKeysLoading && tagKeys.length > 0 && (
        <TagFilterPopoverContent tagKeys={tagKeys} onCancel={closePopover} onSave={handleSave} />
      )}
      {tagKeysLoading && (
        <div className="euiFilterSelect__note">
          <div className="euiFilterSelect__noteContent">
            <EuiLoadingChart size="m" />
            <EuiSpacer size="xs" />
            <p>Loading filters</p>
          </div>
        </div>
      )}
      {tagKeys.length === 0 && (
        <div className="euiFilterSelect__note">
          <div className="euiFilterSelect__noteContent">
            <EuiIcon type="minusInCircle" />
            <EuiSpacer size="xs" />
            <p>No options found</p>
          </div>
        </div>
      )}
    </EuiPopover>
  );
};
