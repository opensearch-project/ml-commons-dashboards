/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import { IOption, StatusFilter } from '../status_filter';
import { ModelDeployStatus } from './types';

interface Props {
  selection: ModelDeployStatus[] | undefined;
  onChange: (status: ModelDeployStatus[]) => void;
}

const MODEL_STATUS: ModelDeployStatus[] = ['responding', 'partial-responding', 'not-responding'];

export const ModelStatusFilter = ({ selection = [], onChange }: Props) => {
  const statusFilterOptions = useMemo(
    () =>
      MODEL_STATUS.map((status) => ({
        value: status,
        checked: selection.includes(status) ? ('on' as const) : undefined,
      })),
    [selection]
  );

  const handleFilterUpdate = useCallback(
    (newOptions: IOption[]) => {
      onChange(newOptions.filter(({ checked }) => checked === 'on').map(({ value }) => value));
    },
    [onChange]
  );

  return <StatusFilter options={statusFilterOptions} onUpdateFilters={handleFilterUpdate} />;
};
