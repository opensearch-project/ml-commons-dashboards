/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { Link, generatePath, useHistory } from 'react-router-dom';
import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui';

import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../../src/core/public/utils';
import { routerPaths } from '../../../../common';
import { APIProvider } from '../../../../public/apis/api_provider';

import { TypeTextConfirmModal } from './type_text_confirm_modal';

const typeTextConfirmModalStyle = { width: 500 };

interface ModelDeleteConfirmModalProps {
  id: string;
  name: string;
  closeModal: (data: { succeed: boolean; canceled: boolean }) => void;
}

export const ModelDeleteConfirmModal = ({ id, name, closeModal }: ModelDeleteConfirmModalProps) => {
  const {
    services: { notifications },
  } = useOpenSearchDashboards();
  const [isDeleting, setIsDeleting] = useState(false);
  const history = useHistory();

  const handleCancel = useCallback(() => {
    if (isDeleting) {
      return;
    }
    closeModal({ canceled: true, succeed: false });
  }, [isDeleting, closeModal]);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      // TODO: move to delete in background and hide confirm modal
      const modelVersionIds: string[] = [];
      while (true) {
        const searchResult = await APIProvider.getAPI('modelVersion').search({
          from: modelVersionIds.length,
          size: 50,
          modelIds: [id],
        });
        searchResult.data.forEach((modelVersion) => {
          modelVersionIds.push(modelVersion.id);
        });
        if (modelVersionIds.length >= searchResult.total_model_versions) {
          break;
        }
      }
      for (let i = 0; i < modelVersionIds.length; i++) {
        await APIProvider.getAPI('modelVersion').delete(modelVersionIds[i]);
      }
      /**
       * Model group can't be deleted if there are model versions in it
       * We need to wait for all versions can't be searchable
       **/
      while (true) {
        if (
          (
            await APIProvider.getAPI('modelVersion').search({
              from: 0,
              size: 1,
              modelIds: [id],
            })
          ).total_model_versions === 0
        ) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      await APIProvider.getAPI('model').delete(id);
      /**
       * Model group still can be searchable after delete
       * We need to wait for model can't be searchable
       **/
      while (true) {
        if (
          (await APIProvider.getAPI('model').search({ ids: [id], from: 0, size: 0 }))
            .total_models === 0
        ) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (e) {
      closeModal({ succeed: false, canceled: false });
      const modelLinkAddress = history.createHref({
        pathname: generatePath(routerPaths.model, { id }),
      });
      notifications?.toasts.addDanger({
        title: mountReactNode(
          <>
            Unable to delete <EuiLink href={modelLinkAddress}>{name}</EuiLink>
          </>
        ),
      });
      return;
    } finally {
      setIsDeleting(false);
    }
    notifications?.toasts.addSuccess({
      title: mountReactNode(
        <>
          <b>{name}</b> has been deleted
        </>
      ),
    });
    closeModal({ succeed: true, canceled: false });
  }, [id, name, closeModal, notifications, history]);

  return (
    <TypeTextConfirmModal
      style={typeTextConfirmModalStyle}
      title={
        <h2>
          Delete{' '}
          <Link to={generatePath(routerPaths.model, { id })}>
            <EuiLink>{name} version</EuiLink>
          </Link>
          ?
        </h2>
      }
      textToType={name}
      confirmButtonText="Delete model"
      buttonColor="danger"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmButtonDisabled={isDeleting}
      isLoading={isDeleting}
    >
      <EuiSpacer size="s" />
      <EuiText>This will delete all versions of this model. This action is irreversible.</EuiText>
      <EuiSpacer size="m" />
      <EuiSpacer size="xs" />
    </TypeTextConfirmModal>
  );
};
