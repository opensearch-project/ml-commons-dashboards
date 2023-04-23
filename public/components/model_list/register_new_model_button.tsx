/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { EuiButton, EuiButtonProps } from '@elastic/eui';
import { RegisterModelTypeModal } from '../register_model_type_modal';

interface RegisterNewModelButtonProps {
  buttonProps?: Partial<EuiButtonProps>;
}

export function RegisterNewModelButton({ buttonProps }: RegisterNewModelButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  return (
    <>
      <EuiButton onClick={showModal} iconType="plusInCircle" color="primary" fill {...buttonProps}>
        Register model
      </EuiButton>
      {isModalVisible && <RegisterModelTypeModal onCloseModal={closeModal} />}
    </>
  );
}
