/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonIcon } from '@elastic/eui';
import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { routerPaths } from '../../../common';
import { ModelDeleteConfirmModal } from '../common/modals/model_delete_confirm_modal';

interface ModelDeleteButtonProps {
  id: string;
  name: string;
}

export const ModelDeleteButton = ({ id, name }: ModelDeleteButtonProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const history = useHistory();

  const handleDeleteButtonClick = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const handleModalClose = useCallback(
    ({ succeed }: { succeed: boolean; canceled: boolean }) => {
      if (succeed) {
        history.push(routerPaths.modelList);
        return;
      }
      setIsModalVisible(false);
    },
    [history]
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
