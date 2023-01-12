/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiIcon,
  EuiButtonEmpty,
  EuiFieldText,
  EuiPopover,
  EuiFlexGroup,
  EuiFieldNumber,
  EuiSelect,
  EuiButton,
  EuiFlexItem,
  EuiFormRow,
} from '@elastic/eui';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { isNil } from 'lodash';
import { Storage } from '../../../../../src/plugins/opensearch_dashboards_utils/public/';

export interface RefreshIntervalProps {
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
  /**
   * If set, interval settings are persisted to local storage with the provided string
   */
  persistence?: string;
}

const intervalUnitOptions = [
  { text: 'seconds', value: 's' },
  { text: 'minutes', value: 'm' },
  { text: 'hours', value: 'h' },
];

const storage = new Storage(localStorage);

export const RefreshInterval = ({
  onRefresh,
  onRefreshChange,
  persistence,
  // default interval 10s
  minInterval = 10 * 1000,
}: RefreshIntervalProps) => {
  const defaultInterval = minInterval / 1000;
  const defaultUnit = 's';
  const defaultIsPaused = true;

  const [intervalValue, setIntervalValue] = useState(defaultInterval);
  const [intervalUnit, setIntervalUnit] = useState(defaultUnit);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(defaultIsPaused);

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

  // Read interval settings from localStorage if `persistence` is set
  useEffect(() => {
    if (persistence) {
      const persistedSetting = storage.get(persistence);
      if (!isNil(persistedSetting?.intervalValue)) {
        setIntervalValue(persistedSetting?.intervalValue);
      }
      if (!isNil(persistedSetting?.intervalUnit)) {
        setIntervalUnit(persistedSetting?.intervalUnit);
      }
      if (!isNil(persistedSetting?.isPaused)) {
        setIsPaused(persistedSetting?.isPaused);
      }
    }
  }, [persistence]);

  // Write interval settings to localStorage if `persistence` is set
  useEffect(() => {
    if (persistence) {
      storage.set(persistence, { intervalValue, intervalUnit, isPaused });
    }
  }, [intervalValue, intervalUnit, isPaused, persistence]);

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
        intervalId = window.setInterval(() => {
          onRefresh();
        }, interval);
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
    <EuiButtonEmpty
      iconType="arrowDown"
      iconSide="right"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      aria-label="set refresh interval"
    >
      <EuiIcon type="clock" />
    </EuiButtonEmpty>
  );

  let errors: string[] = [];
  if (isInvalid) {
    errors = ['Enter a refresh rate greater than 10 seconds.'];
  }

  return (
    <EuiFieldText
      aria-label="current interval value"
      readOnly
      value={displayedIntervalValue}
      prepend={
        <EuiPopover
          button={intervalButton}
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
        >
          <EuiFormRow
            label="Refresh every"
            helpText="Enter an auto-refresh rate for the page greater than 10 seconds"
            isInvalid={isInvalid}
            error={errors}
          >
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFieldNumber
                  aria-label="interval value input"
                  isInvalid={isInvalid}
                  value={intervalValue}
                  onChange={onIntervalValueChange}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSelect
                  aria-label="interval unit selector"
                  isInvalid={isInvalid}
                  value={intervalUnit}
                  options={intervalUnitOptions}
                  onChange={onUnitChange}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton
                  aria-label={`${isPaused ? 'start' : 'stop'} refresh interval`}
                  disabled={isInvalid}
                  iconType={isPaused ? 'play' : 'pause'}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? 'Start' : 'Stop'}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
        </EuiPopover>
      }
    />
  );
};
