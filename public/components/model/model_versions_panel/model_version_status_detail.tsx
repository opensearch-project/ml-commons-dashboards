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

import { MODEL_VERSION_STATE, routerPaths } from '../../../../common';
import { UiSettingDateFormatTime } from '../../common';
import { APIProvider } from '../../../apis/api_provider';

import { ModelVersionErrorDetailsModal } from '../../common';

// TODO: Change to related time field after confirmed
export const state2DetailContentMap: {
  [key in MODEL_VERSION_STATE]?: {
    title: string;
    description: (versionLink: React.ReactNode) => React.ReactNode;
    timeTitle?: string;
    timeField?: 'createdTime' | 'lastRegisteredTime' | 'lastDeployedTime' | 'lastUndeployedTime';
  };
} = {
  [MODEL_VERSION_STATE.registering]: {
    title: 'In progress...',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} is uploading.</>
    ),
  },
  [MODEL_VERSION_STATE.deploying]: {
    title: 'In progress...',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} is deploying.</>
    ),
  },
  [MODEL_VERSION_STATE.registered]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => (
      <>The model artifact for {versionLink} uploaded.</>
    ),
    timeTitle: 'Uploaded on',
    timeField: 'lastRegisteredTime',
  },
  [MODEL_VERSION_STATE.deployed]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => <>{versionLink} deployed.</>,
    timeTitle: 'Deployed on',
    timeField: 'lastDeployedTime',
  },
  [MODEL_VERSION_STATE.undeployed]: {
    title: 'Success',
    description: (versionLink: React.ReactNode) => <>{versionLink} undeployed.</>,
    timeTitle: 'Undeployed on',
    timeField: 'lastUndeployedTime',
  },
  [MODEL_VERSION_STATE.deployFailed]: {
    title: 'Error',
    description: (versionLink: React.ReactNode) => <>{versionLink} deployment failed.</>,
    timeTitle: 'Deployment failed on',
    timeField: 'lastDeployedTime',
  },
  [MODEL_VERSION_STATE.registerFailed]: {
    title: 'Error',
    description: (versionLink: React.ReactNode) => <>{versionLink} artifact upload failed.</>,
    timeTitle: 'Upload failed on',
    timeField: 'createdTime',
  },
  [MODEL_VERSION_STATE.partiallyDeployed]: {
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
  state: MODEL_VERSION_STATE;
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
    const state2TaskTypeMap: { [key in MODEL_VERSION_STATE]?: string } = {
      [MODEL_VERSION_STATE.deployFailed]: 'DEPLOY_MODEL',
      [MODEL_VERSION_STATE.registerFailed]: 'REGISTER_MODEL',
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
          {(state === MODEL_VERSION_STATE.deployFailed ||
            state === MODEL_VERSION_STATE.registerFailed) && (
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
          errorType={
            state === MODEL_VERSION_STATE.deployFailed
              ? 'deployment-failed'
              : 'artifact-upload-failed'
          }
          closeModal={handleCloseModal}
        />
      )}
    </>
  );
};
