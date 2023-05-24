/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiText,
  EuiButton,
  EuiPopoverTitle,
  EuiLink,
} from '@elastic/eui';
import { Link, generatePath } from 'react-router-dom';

import { MODEL_STATE, routerPaths } from '../../../../common';
import { UiSettingDateFormatTime } from '../../common';
import { APIProvider } from '../../../apis/api_provider';

import { ModelVersionErrorDetailsModal } from './model_version_error_details_modal';

// TODO: Change to related time field after confirmed
export const state2DetailContentMap: {
  [key in MODEL_STATE]?: {
    title: string;
    description: (versionLink: React.ReactNode) => React.ReactNode;
    timeTitle?: string;
    timeField?: 'createdTime' | 'lastRegisteredTime' | 'lastDeployedTime' | 'lastUndeployedTime';
  };
} = {
  [MODEL_STATE.uploading]: {
    title: 'In progress...',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} is uploading.</>
    ),
  },
  [MODEL_STATE.loading]: {
    title: 'In progress...',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} is deploying.</>
    ),
  },
  [MODEL_STATE.uploaded]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} uploaded.</>
    ),
    timeTitle: 'Uploaded on',
    timeField: 'lastRegisteredTime',
  },
  [MODEL_STATE.loaded]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => <>{versionLink} deployed.</>,
    timeTitle: 'Deployed on',
    timeField: 'lastDeployedTime',
  },
  [MODEL_STATE.unloaded]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => <>{versionLink} undeployed.</>,
    timeTitle: 'Undeployed on',
    timeField: 'lastUndeployedTime',
  },
  [MODEL_STATE.loadFailed]: {
    title: 'Error',
    description: (versionLink: React.ReactNode) => <>{versionLink} deployment failed.</>,
    timeTitle: 'Deployment failed on',
    timeField: 'lastDeployedTime',
  },
  [MODEL_STATE.registerFailed]: {
    title: 'Error',
    description: (versionLink: React.ReactNode) => <>{versionLink} artifact upload failed.</>,
    timeTitle: 'Upload failed on',
    timeField: 'createdTime',
  },
  [MODEL_STATE.partiallyLoaded]: {
    title: 'Warning',
    description: (versionLink: React.ReactNode) => (
      <>{versionLink} is deployed and partially responding.</>
    ),
    timeTitle: 'Last responded on',
    timeField: 'createdTime',
  },
};

export const ModelVersionStatusDetail = ({
  id,
  name,
  state,
  version,
  ...restProps
}: {
  id: string;
  state: MODEL_STATE;
  name: string;
  version: string;
  createdTime: number;
  lastRegisteredTime?: number;
  lastDeployedTime?: number;
  lastUndeployedTime?: number;
}) => {
  const [isErrorDetailsModalShowed, setIsErrorDetailsModalShowed] = useState(false);
  const [isLoadingErrorDetails, setIsLoadingErrorDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>();

  const handleSeeFullErrorClick = useCallback(async () => {
    const state2TaskTypeMap: { [key in MODEL_STATE]?: string } = {
      [MODEL_STATE.loadFailed]: 'DEPLOY_MODEL',
      [MODEL_STATE.registerFailed]: 'REGISTER_MODEL',
    };
    if (!(state in state2TaskTypeMap)) {
      return;
    }
    if (errorDetails) {
      setIsErrorDetailsModalShowed(true);
      return;
    }
    setIsLoadingErrorDetails(true);
    try {
      const { data } = await APIProvider.getAPI('task').search({
        modelId: id,
        taskType: state2TaskTypeMap[state],
        from: 0,
        size: 1,
        sort: 'last_update_time-desc',
      });
      if (data[0]?.error) {
        setErrorDetails(data[0].error);
        setIsErrorDetailsModalShowed(true);
      }
    } finally {
      setIsLoadingErrorDetails(false);
    }
  }, [state, id, errorDetails]);

  const handleCloseModal = useCallback(() => {
    setIsErrorDetailsModalShowed(false);
  }, []);

  const statusContent = state2DetailContentMap[state];
  if (!statusContent) {
    return <>-</>;
  }
  const { title, description, timeTitle, timeField } = statusContent;
  const timeValue = timeField ? restProps[timeField] : undefined;

  return (
    <>
      <div style={{ maxWidth: 300 - 16 }}>
        <EuiPopoverTitle
          paddingSize="s"
          style={{ paddingLeft: 16, paddingRight: 16, textTransform: 'none' }}
        >
          <EuiText>{title}</EuiText>
        </EuiPopoverTitle>
        <div style={{ padding: 8 }}>
          <EuiText>
            {description(
              <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
                {name} version {version}
              </Link>
            )}
          </EuiText>
          {timeTitle && (
            <>
              <EuiSpacer size="s" />
              <EuiText>
                <b>{timeTitle}:</b> <UiSettingDateFormatTime time={timeValue} />
              </EuiText>
            </>
          )}
          {(state === MODEL_STATE.loadFailed || state === MODEL_STATE.registerFailed) && (
            <>
              <EuiSpacer size="s" />
              <EuiFlexGroup justifyContent="flexEnd" gutterSize="none">
                <EuiButton
                  color="danger"
                  onClick={handleSeeFullErrorClick}
                  isLoading={isLoadingErrorDetails}
                  disabled={isLoadingErrorDetails}
                >
                  See full error
                </EuiButton>
              </EuiFlexGroup>
            </>
          )}
        </div>
      </div>
      {isErrorDetailsModalShowed && errorDetails && (
        <ModelVersionErrorDetailsModal
          id={id}
          name={name}
          version={version}
          errorDetails={errorDetails}
          isDeployFailed={state === MODEL_STATE.loadFailed}
          closeModal={handleCloseModal}
        />
      )}
    </>
  );
};
