/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import { CommonProps, EuiComboBox, EuiComboBoxProps } from '@elastic/eui';

export type OptionWithCommonProps<T> = { value: T } & CommonProps;

export type PrimitiveComboBoxProps<T extends string | number> = Omit<
  EuiComboBoxProps<T>,
  'options' | 'selectedOptions' | 'onChange' | 'singleSelection'
> & {
  options: Array<T | OptionWithCommonProps<T>>;
  attachOptionTestSubj?: boolean;
} & (
    | {
        multi?: false;
        value: T | undefined;
        onChange: (value: T | undefined) => void;
      }
    | {
        multi: true;
        value: T[] | undefined;
        onChange: (value: T[] | undefined) => void;
      }
  );

export const PrimitiveComboBox = <T extends string | number>({
  multi,
  value,
  onChange,
  options: optionsInProps,
  attachOptionTestSubj,
  'data-test-subj': parentDataTestSubj,
  ...restProps
}: PrimitiveComboBoxProps<T>) => {
  const options = useMemo(
    () =>
      optionsInProps.map((option) =>
        typeof option === 'object'
          ? { label: option.value.toString(), ...option }
          : {
              label: option.toString(),
              value: option,
              ...(attachOptionTestSubj
                ? {
                    'data-test-subj': `${
                      parentDataTestSubj ? `${parentDataTestSubj}-` : ''
                    }${option.toString()}`,
                  }
                : {}),
            }
      ),
    [optionsInProps, attachOptionTestSubj, parentDataTestSubj]
  );
  const selectedOptions = useMemo(() => {
    if (multi) {
      return options.filter((option) => value?.includes(option.value));
    }
    return options.filter((option) => value === option.value);
  }, [multi, value, options]);

  const handleChange = useCallback<Required<EuiComboBoxProps<T>>['onChange']>(
    (newOptions) => {
      const result: T[] = [];
      newOptions.forEach((item) => {
        if (item.value !== undefined) {
          result.push(item.value);
        }
      });
      if (multi) {
        onChange(result.length === 0 ? undefined : result);
        return;
      }
      onChange(result[0]);
    },
    [multi, onChange]
  );

  return (
    <EuiComboBox
      options={options}
      selectedOptions={selectedOptions}
      onChange={handleChange}
      {...(multi ? {} : { singleSelection: true })}
      data-test-subj={parentDataTestSubj}
      {...restProps}
    />
  );
};
