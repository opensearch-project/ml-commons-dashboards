/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiRadio,
  htmlIdGenerator,
} from '@elastic/eui';

type TagValueType = 'number' | 'string';

interface TagTypePopoverProps {
  value: TagValueType;
  onApply: (type: TagValueType) => void;
  disabled?: boolean;
  className?: string;
}

export const TagTypePopover = ({ value, onApply, disabled, className }: TagTypePopoverProps) => {
  const [tagType, setTagType] = useState(value);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onApplyType = useCallback(() => {
    onApply(tagType);
    setIsPopoverOpen(false);
  }, [tagType, onApply]);

  return (
    <EuiPopover
      className={className}
      button={
        <EuiButtonEmpty
          aria-label="select tag type"
          style={{ width: 95 }}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          size="xs"
          iconType="arrowDown"
          iconSide="right"
          disabled={disabled}
        >
          {value === 'number' ? 'Number' : 'String'}
        </EuiButtonEmpty>
      }
      closePopover={() => setIsPopoverOpen(false)}
      isOpen={isPopoverOpen}
      panelPaddingSize="s"
    >
      <EuiPopoverTitle>TAG TYPE</EuiPopoverTitle>
      <EuiRadio
        label="String"
        id={htmlIdGenerator()()}
        value="string"
        checked={tagType === 'string'}
        onChange={() => setTagType('string')}
      />
      <EuiRadio
        label="Number"
        id={htmlIdGenerator()()}
        value="number"
        checked={tagType === 'number'}
        onChange={() => setTagType('number')}
      />
      <EuiPopoverFooter>
        <EuiButton fullWidth size="s" onClick={onApplyType}>
          Apply
        </EuiButton>
      </EuiPopoverFooter>
    </EuiPopover>
  );
};
