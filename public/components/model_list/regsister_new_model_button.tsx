/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useMemo } from 'react';
import { EuiButton } from '@elastic/eui';
import { RegisterModelTypeModal } from '../register_model_type_modal';
import { ModelTypes } from './register_model_types';
interface Props {
  selection: ModelTypes[] | undefined;
}
const MODEL_STATUS: ModelTypes[] = [
  'tapas-tiny',
  'electra-small-generator',
  'flan-T5-large-grammer-synthesis',
  'BEiT',
];
export function RegisterNewModelButton({ selection = [] }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  const statusFilterOptions = useMemo(
    () =>
      MODEL_STATUS.map((status) => ({
        value: status,
        checked: selection.includes(status) ? ('on' as const) : undefined,
      })),
    [selection]
  );
  return (
    <>
      <EuiButton onClick={showModal}>Register new model</EuiButton>
      {isModalVisible && (
        <RegisterModelTypeModal onCloseModal={closeModal} options={statusFilterOptions} />
      )}
    </>
  );
}
