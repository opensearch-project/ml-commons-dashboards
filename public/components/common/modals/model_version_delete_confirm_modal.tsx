/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui';
import { Link, generatePath, useHistory } from 'react-router-dom';
import { timer } from 'rxjs';
import { scan, switchMap, takeWhile } from 'rxjs/operators';

import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { mountReactNode } from '../../../../../../src/core/public/utils';
import { routerPaths } from '../../../../common';
import { APIProvider } from '../../../apis/api_provider';

import { TypeTextConfirmModal } from './type_text_confirm_modal';

const typeTextConfirmModalStyle = { width: 500 };

interface ModelVersionDeleteConfirmModalProps {
  id: string;
  name: string;
  version: string;
  closeModal: (versionDeleted: boolean) => void;
}

export const ModelVersionDeleteConfirmModal = ({
  id,
  name,
  version,
  closeModal,
}: ModelVersionDeleteConfirmModalProps) => {
  const {
    services: { notifications },
  } = useOpenSearchDashboards();
  const history = useHistory();
  const [isDeleting, setIsDeleting] = useState(false);
  const mountedRef = useRef(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    const modelVersionAddress = history.createHref({
      pathname: generatePath(routerPaths.modelVersion, { id }),
    });
    try {
      await APIProvider.getAPI('modelVersion').delete(id);
    } catch {
      notifications?.toasts.addDanger({
        title: mountReactNode(
          <>
            Unable to delete{' '}
            <EuiLink href={modelVersionAddress}>
              {name} version {version}
            </EuiLink>
          </>
        ),
      });
      closeModal(false);
      return;
    }
    /**
     *
     * Delete a model version is a sync operation, but the deleted model
     * still can be searched by model search API after model version deleted.
     * Add this polling here to make sure version can't searchable.
     *
     **/
    timer(0, 300)
      .pipe(scan((acc) => acc + 1, 0))
      .pipe(takeWhile(() => mountedRef.current))
      .pipe(
        switchMap(async (times) => {
          const searchResult = await APIProvider.getAPI('modelVersion').search({
            ids: [id],
            from: 0,
            size: 1,
          });
          return {
            searchResult,
            times,
          };
        })
      )
      .pipe(
        takeWhile(({ searchResult, times }) => searchResult.total_model_versions > 0 || times < 200)
      )
      .subscribe(({ times, searchResult }) => {
        if (searchResult.total_model_versions === 0) {
          notifications?.toasts.addSuccess({
            title: mountReactNode(
              <>
                <b>
                  {name} version {version}
                </b>{' '}
                has been deleted
              </>
            ),
          });
          closeModal(true);
          return;
        }
        if (times === 200) {
          closeModal(false);
          return;
        }
      });
  }, [id, name, version, history, notifications, closeModal]);

  const handleModalCancel = useCallback(() => {
    closeModal(false);
  }, [closeModal]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <TypeTextConfirmModal
      style={typeTextConfirmModalStyle}
      title={
        <h2>
          Delete{' '}
          <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
            {name} version {version}
          </Link>
          ?
        </h2>
      }
      textToType={`${name} version ${version}`}
      confirmButtonText="Delete version"
      buttonColor="danger"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleModalCancel}
      confirmButtonDisabled={isDeleting}
      isLoading={isDeleting}
    >
      <EuiSpacer size="s" />
      <EuiText>This action is irreversible.</EuiText>
      <EuiSpacer size="m" />
      <EuiSpacer size="xs" />
    </TypeTextConfirmModal>
  );
};
