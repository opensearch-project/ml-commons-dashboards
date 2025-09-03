/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonIcon } from '@elastic/eui';
import React, { useState, useCallback } from 'react';

import { ModelDeleteConfirmModal } from '../common/modals/model_delete_confirm_modal';

interface ModelTableRowDeleteButtonProps {
  id: string;
  name: string;
  onDeleted: () => void;
}

export const ModelTableRowDeleteButton = ({
  id,
  name,
  onDeleted,
}: ModelTableRowDeleteButtonProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeleteButtonClick = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const handleModalClose = useCallback(
    ({ succeed }: { succeed: boolean; canceled: boolean }) => {
      if (succeed) {
        onDeleted();
      }
    },
    [onDeleted]
  );

  return (
    <>
      <EuiButtonIcon
        aria-label="Delete model"
        color="danger"
        iconType="trash"
        onClick={handleDeleteButtonClick}
      >
        Delete
      </EuiButtonIcon>
      {isModalVisible && (
        <ModelDeleteConfirmModal id={id} name={name} closeModal={handleModalClose} />
      )}
    </>
  );
};
