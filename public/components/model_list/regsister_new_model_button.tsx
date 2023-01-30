/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { EuiButton, EuiPageHeader } from '@elastic/eui';
import { RegisterModelTypeModal } from '../register_model_type_modal';
export function RegisterNewModelButton(props: any) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  // let modal;
  // if (isModalVisible) {
  //   modal = <RegisterModelTypeModal onCloseModal={closeModal} />;
  // }
  return (
    <EuiPageHeader>
      <EuiButton onClick={showModal}>Register new model</EuiButton>
      {/* {modal} */}
      {isModalVisible && <RegisterModelTypeModal onCloseModal={closeModal} />}
    </EuiPageHeader>
  );
}
