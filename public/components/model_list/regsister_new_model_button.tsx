/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { EuiButton } from '@elastic/eui';
import { RegisterModelTypeModal } from '../register_model_type_modal';
export function RegisterNewModelButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  return (
    <>
      <EuiButton onClick={showModal} iconType="plusInCircle" color="primary" fill>
        Register model
      </EuiButton>
      {isModalVisible && <RegisterModelTypeModal onCloseModal={closeModal} />}
    </>
  );
}
