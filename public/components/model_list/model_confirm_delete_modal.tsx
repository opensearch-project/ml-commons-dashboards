/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EuiConfirmModal, EuiFormRow, EuiFieldText, EuiLink } from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { usePollingUntil } from '../../hooks/use_polling_until';
export class NoIdProvideError {}
export interface ModelConfirmDeleteModalInstance {
  show: (modelId: string, deployedVersions: string[]) => void;
}
export const ModelConfirmDeleteModal = React.forwardRef<
  ModelConfirmDeleteModalInstance,
  { onDeleted: () => void }
>(({ onDeleted }, ref) => {
  const deleteIdRef = useRef<string>();
  const deployedVersion = useRef<string[]>();
  const [visible, setVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [value, setValue] = useState('');
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  let buttonColor: 'text' | 'danger' = 'text';
  if (value === deleteIdRef.current) {
    buttonColor = 'danger';
  }
  const { start: startPolling } = usePollingUntil({
    continueChecker: async () => {
      if (!deleteIdRef.current) {
        throw new NoIdProvideError();
      }
      return (
        (
          await APIProvider.getAPI('model').search({
            ids: [deleteIdRef.current],
            from: 0,
            size: 1,
          })
        ).total_models === 1
      );
    },
    onGiveUp: () => {
      setIsDeleting(false);
      setVisible(false);
    },
    onMaxRetries: () => {
      setIsDeleting(false);
      setVisible(false);
    },
  });
  const handleConfirm = useCallback(
    async (e) => {
      if (!deleteIdRef.current) {
        throw new NoIdProvideError();
      }
      e.stopPropagation();
      setIsDeleting(true);
      await APIProvider.getAPI('model').delete(deleteIdRef.current);
      startPolling();
    },
    [startPolling]
  );
  const handleCancel = useCallback(() => {
    setVisible(false);
    deleteIdRef.current = undefined;
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      show: (id: string, deployedVersions: string[]) => {
        deleteIdRef.current = id;
        deployedVersion.current = deployedVersions;
        setVisible(true);
      },
    }),
    []
  );
  if (!visible) {
    return null;
  }
  const str = (
    <span>
      Delete{' '}
      <EuiLink color="primary" href="#">
        {deleteIdRef.current}?
      </EuiLink>
    </span>
  );
  const label = (
    <span style={{ fontWeight: 400, fontSize: '16px' }}>
      Type <span style={{ fontWeight: 600 }}>{deleteIdRef.current}</span> to confirm
    </span>
  );
  return (
    <EuiConfirmModal
      style={{ width: '480px' }}
      title={str}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      isLoading={isDeleting}
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      buttonColor={buttonColor}
    >
      <p style={{ fontSize: '16px' }}>
        Deleting this model will delete {deployedVersion.current?.length} versions of this
        model.This is irreversible.
      </p>
      <EuiFormRow label={label}>
        <EuiFieldText name="delete" value={value} onChange={(e) => onChange(e)} />
      </EuiFormRow>
    </EuiConfirmModal>
  );
});
