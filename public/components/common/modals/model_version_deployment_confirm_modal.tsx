/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { EuiConfirmModal, EuiLink } from '@elastic/eui';
import { Link, generatePath } from 'react-router-dom';

import { routerPaths } from '../../../../common';
import { useDeployment } from '../../../hooks/use_deployment';

export const ModelVersionDeploymentConfirmModal = ({
  id,
  mode,
  name,
  version,
  closeModal,
}: {
  id: string;
  mode: 'deploy' | 'undeploy';
  name: string;
  version: string;
  closeModal: (data: { canceled: boolean; succeed: boolean; id: string }) => void;
}) => {
  const { deploy, undeploy } = useDeployment(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapping = {
    deploy: {
      title: 'Deploy',
      description: 'This version will begin deploying.',
      action: deploy,
    },
    undeploy: {
      title: 'Undeploy',
      description: 'This version will be undeployed. You can deploy it again later.',
      action: undeploy,
    },
  };
  const { title, description, action } = mapping[mode];

  const handleCancel = useCallback(() => {
    closeModal({ canceled: true, succeed: false, id });
  }, [closeModal, id]);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await action({
        onComplete: () => {
          setIsSubmitting(false);
          closeModal({ canceled: false, succeed: true, id });
        },
        onError: () => {
          setIsSubmitting(false);
          closeModal({ canceled: false, succeed: false, id });
        },
      });
    } catch (e) {
      setIsSubmitting(false);
      closeModal({ canceled: false, succeed: false, id });
      return;
    }
    // undeploy action won't call onComplete after success, so need to handle undeploy success here
    if (mode === 'undeploy') {
      setIsSubmitting(false);
      closeModal({ canceled: false, succeed: true, id });
    }
  }, [id, mode, action, closeModal]);

  return (
    <EuiConfirmModal
      title={
        <>
          {title}{' '}
          <Link to={generatePath(routerPaths.modelVersion, { id })} component={EuiLink}>
            {name} version {version}
          </Link>
        </>
      }
      confirmButtonText={title}
      cancelButtonText="Cancel"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmButtonDisabled={isSubmitting}
      isLoading={isSubmitting}
      maxWidth={500}
    >
      {description}
    </EuiConfirmModal>
  );
};
