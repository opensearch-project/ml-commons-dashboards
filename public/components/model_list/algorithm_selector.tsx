/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { APIProvider } from '../../apis/api_provider';
import { PrimitiveComboBox, PrimitiveComboBoxProps } from '../primitive_combo_box';

export const AlgorithmSelector = (props: Omit<PrimitiveComboBoxProps<string>, 'options'>) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    APIProvider.getAPI('modelAlgorithm')
      .getAll()
      .then((payload) => {
        setOptions(payload);
      });
  }, []);

  return (
    <PrimitiveComboBox<string>
      {...(props as PrimitiveComboBoxProps<string>)}
      options={options}
      placeholder="All algorithm"
      data-test-subj="algorithm-selector"
      attachOptionTestSubj
    />
  );
};
