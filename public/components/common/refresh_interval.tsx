/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiIcon,
  EuiSmallButtonEmpty,
  EuiCompressedFieldText,
  EuiPopover,
  EuiFlexGroup,
  EuiCompressedFieldNumber,
  EuiCompressedSelect,
  EuiSmallButton,
  EuiFlexItem,
  EuiCompressedFormRow,
} from '@elastic/eui';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

interface RefreshIntervalProps {
  /**
   * When refresh value/unit/isPaused changed
   */
  onRefreshChange?: (args: { value: number; isPaused: boolean }) => void;
  /**
   * When interval function is called
   */
  onRefresh: () => void;
  /**
   * The minimum allowed interval value(in milliseconds)
   */
  minInterval?: number;
}

const intervalUnitOptions = [
  { text: 'seconds', value: 's' },
  { text: 'minutes', value: 'm' },
  { text: 'hours', value: 'h' },
];

const MAX_SIGNED_32_BIT_INTEGER = 2147483647;

export const RefreshInterval = ({
  onRefresh,
  onRefreshChange,
  minInterval = 10 * 1000,
}: RefreshIntervalProps) => {
  // default interval 10s
  const [intervalValue, setIntervalValue] = useState(minInterval / 1000);
  const [intervalUnit, setIntervalUnit] = useState('s');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const onIntervalValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIntervalValue(Number(e.target.value));
  }, []);

  const onUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setIntervalUnit(e.target.value);
  }, []);

  const displayedIntervalValue = useMemo(() => {
    if (isPaused) {
      return 'Off';
    }

    const unit = intervalUnitOptions.find((option) => option.value === intervalUnit);
    if (unit) {
      return `${intervalValue} ${unit.text}`;
    }
  }, [isPaused, intervalUnit, intervalValue]);

  const interval = useMemo(() => {
    switch (intervalUnit) {
      case 's':
        return intervalValue * 1000;
      case 'm':
        return intervalValue * 60 * 1000;
      case 'h':
        return intervalValue * 3600 * 1000;
      default:
        return null;
    }
  }, [intervalUnit, intervalValue]);

  const isInvalid = interval === null || interval < minInterval;

  useEffect(() => {
    if (isInvalid) {
      setIsPaused(true);
    }
  }, [isInvalid]);

  useEffect(() => {
    let intervalId: number | null = null;

    if (isPaused) {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    } else {
      if (interval !== null) {
        /**
         * According https://developer.mozilla.org/en-US/docs/Web/API/setInterval#return_value
         * the max delayed value of setInterval is MAX_SIGNED_32_BIT_INTEGER, the inner function will be executed immediately
         * if the delayed value is greater than MAX_SIGNED_32_BIT_INTEGER. Add a Math.min here to avoid been executed immediately.
         **/
        intervalId = window.setInterval(() => {
          onRefresh();
        }, Math.min(interval, MAX_SIGNED_32_BIT_INTEGER));
      }
    }

    if (interval !== null && onRefreshChange) {
      onRefreshChange({ value: interval, isPaused });
    }

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [interval, isPaused, onRefresh, onRefreshChange]);

  const intervalButton = (
    <EuiSmallButtonEmpty
      iconType="arrowDown"
      iconSide="right"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      aria-label="set refresh interval"
    >
      <EuiIcon type="clock" />
    </EuiSmallButtonEmpty>
  );

  let errors: string[] = [];
  if (isInvalid) {
    errors = ['Enter an auto-refresh rate greater than 10 seconds.'];
  }

  return (
    <EuiCompressedFieldText
      aria-label="current interval value"
      readOnly
      value={displayedIntervalValue}
      prepend={
        <EuiPopover
          button={intervalButton}
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
        >
          <EuiCompressedFormRow
            label="Refresh every"
            helpText={
              errors.length > 0 ? '' : 'Enter an auto-refresh rate greater than 10 seconds.'
            }
            isInvalid={isInvalid}
            error={errors}
          >
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiCompressedFieldNumber
                  aria-label="interval value input"
                  isInvalid={isInvalid}
                  value={intervalValue}
                  onChange={onIntervalValueChange}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCompressedSelect
                  aria-label="interval unit selector"
                  isInvalid={isInvalid}
                  value={intervalUnit}
                  options={intervalUnitOptions}
                  onChange={onUnitChange}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSmallButton
                  aria-label={`${isPaused ? 'start' : 'stop'} refresh interval`}
                  disabled={isInvalid}
                  iconType={isPaused ? 'play' : 'stop'}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? 'Start' : 'Stop'}
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCompressedFormRow>
        </EuiPopover>
      }
    />
  );
};
