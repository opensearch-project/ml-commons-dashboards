/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  EuiButtonIcon,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';

import { tagKeyTypeOptions, TagKeyType } from '../../common';

const FORM_ITEM_WIDTH = 400;

const TagKeyDeleteConfirmModal = ({ closeModal }: { closeModal: (confirmed: boolean) => void }) => {
  const handleConfirm = useCallback(() => {
    closeModal(true);
  }, [closeModal]);

  const handleCancel = useCallback(() => {
    closeModal(false);
  }, [closeModal]);

  return (
    <EuiConfirmModal
      title={<h2>Delete tag key?</h2>}
      cancelButtonText="Cancel"
      confirmButtonText="Delete tag key"
      maxWidth={500}
      buttonColor="danger"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <EuiText>
        Deleting this tag key will remove the tag and the tag&apos;s values from all versions of
        this model. This action is irreversible.
      </EuiText>
    </EuiConfirmModal>
  );
};

export const ModelSavedTagKey = ({
  name,
  type,
  index,
  showRemoveButton,
  onRemove,
  showLabel,
}: {
  name: string;
  type: TagKeyType;
  index: number;
  showRemoveButton: boolean;
  onRemove: (index: number) => void;
  showLabel: boolean;
}) => {
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);

  const handleRemoveClick = useCallback(() => {
    setIsDeleteConfirmModalVisible(true);
  }, []);

  const closeModal = useCallback(
    (confirmed: boolean) => {
      setIsDeleteConfirmModalVisible(false);
      if (confirmed) {
        onRemove(index);
      }
    },
    [onRemove, index]
  );

  return (
    <>
      <EuiFlexGroup gutterSize="m" tabIndex={-1}>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label={showLabel ? 'Key' : ''}>
            <EuiFieldText readOnly value={name} />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ width: FORM_ITEM_WIDTH }}>
          <EuiFormRow label={showLabel ? 'Type' : ''}>
            <EuiFieldText
              readOnly
              value={tagKeyTypeOptions.find((item) => item.value === type)?.label}
            />
          </EuiFormRow>
        </EuiFlexItem>
        {showRemoveButton && (
          <EuiFlexItem
            grow={false}
            style={showLabel ? { transform: 'translateY(22px)' } : undefined}
          >
            <EuiButtonIcon
              size="m"
              iconType="trash"
              color="danger"
              aria-label={`Remove saved tag key at row ${index + 1}`}
              onClick={handleRemoveClick}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {isDeleteConfirmModalVisible && <TagKeyDeleteConfirmModal closeModal={closeModal} />}
    </>
  );
};
