/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useMemo } from 'react';
import { EuiButton } from '@elastic/eui';
import { RegisterModelTypeModal } from '../register_model_type_modal';
const MODEL_LIST = [
  {
    name: 'tapas-tiny',
    description:
      'TAPAS is a BERT-like transformers model pretrained on a large corpus of English data from Wikipedia in a self-supervised fashion',
  },
  {
    name: 'electra-small-generator',
    description: 'ELECTRA is a new method for self-supervised language representation learning',
  },
  {
    name: 'flan-T5-large-grammer-synthesis',
    description:
      'A fine-tuned version of google/flan-t5-large for grammer correction on an expanded version of the JFLEG dataset',
  },
  {
    name: 'BEiT',
    description:
      'The BEiT model is a version Transformer(ViT),which is a transformer encoder model(BERT-like)',
  },
];
export function RegisterNewModelButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  const statusFilterOptions = useMemo(
    () =>
      MODEL_LIST.map((status) => ({
        name: status.name,

        description: status.description,
      })),
    []
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
