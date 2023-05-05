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
import { APIProvider } from '../../../apis/api_provider';
import { renderTime } from '../../../utils';

import { ModelGroupVersionErrorDetailModal } from './model_group_version_error_detail_modal';

const VERSION_LINK_SYMBOL = '<MODEL_VERSION_LINK>';

// TODO: Change to related time field after confirmed
export const state2DetailContentMap: {
  [key in MODEL_STATE]?: [string, string, string, 'createdTime'];
} = {
  [MODEL_STATE.uploading]: [
    'In progress...',
    `The model artifact for ${VERSION_LINK_SYMBOL} is uploading.`,
    'Upload initiated on',
    'createdTime',
  ],
  [MODEL_STATE.loading]: [
    'In progress...',
    `The model artifact for ${VERSION_LINK_SYMBOL} is deploying.`,
    'Deployment initiated on',
    'createdTime',
  ],
  [MODEL_STATE.uploaded]: [
    'Success',
    `The model artifact for ${VERSION_LINK_SYMBOL} uploaded.`,
    'Uploaded on',
    'createdTime',
  ],
  [MODEL_STATE.loaded]: [
    'Success',
    `${VERSION_LINK_SYMBOL} deployed.`,
    'Deployed on',
    'createdTime',
  ],
  [MODEL_STATE.unloaded]: [
    'Success',
    `${VERSION_LINK_SYMBOL} undeployed.`,
    'Undeployed on',
    'createdTime',
  ],
  [MODEL_STATE.loadFailed]: [
    'Error',
    `${VERSION_LINK_SYMBOL} deployment failed.`,
    'Deployment failed on',
    'createdTime',
  ],
  [MODEL_STATE.registerFailed]: [
    'Error',
    `${VERSION_LINK_SYMBOL} artifact upload failed.`,
    'Upload failed on',
    'createdTime',
  ],
  [MODEL_STATE.partiallyLoaded]: [
    'Warning',
    `${VERSION_LINK_SYMBOL} is deployed and partially responding.`,
    'Last responded on',
    'createdTime',
  ],
};

export const ModelGroupVersionStatusDetail = ({
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
}) => {
  const [isErrorDetailedModelShowed, setIsErrorDetailedModelShowed] = useState(false);
  const [isLoadingErrorDetails, setIsLoadingErrorDetails] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string>();

  const handleSeeFullErrorClick = useCallback(async () => {
    const state2TaskTypeMap: { [key in MODEL_STATE]?: string } = {
      [MODEL_STATE.loadFailed]: 'DEPLOY_MODEL',
      [MODEL_STATE.registerFailed]: 'REGISTER_MODEL',
    };
    if (!(state in state2TaskTypeMap)) {
      return;
    }
    if (errorDetail) {
      setIsErrorDetailedModelShowed(true);
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
        setErrorDetail(data[0].error);
        setIsErrorDetailedModelShowed(true);
      }
    } finally {
      setIsLoadingErrorDetails(false);
    }
  }, [state, id, errorDetail]);

  const statusContent = state2DetailContentMap[state];
  if (!statusContent) {
    return <>-</>;
  }
  const [title, description, timeTitle, timeField] = statusContent;
  const [beforeVersionLink, afterVersionLink] = description.split(VERSION_LINK_SYMBOL);

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
            {beforeVersionLink}
            <Link component={EuiLink} to={generatePath(routerPaths.modelVersion, { id })}>
              {name} version {version}
            </Link>
            {afterVersionLink}
          </EuiText>
          <EuiSpacer size="s" />
          <EuiText>
            <b>{timeTitle}:</b> {renderTime(restProps[timeField], 'MMM d, yyyy @ HH:mm:ss.SSS')}
          </EuiText>
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
      {isErrorDetailedModelShowed && errorDetail && (
        <ModelGroupVersionErrorDetailModal
          closeModal={() => {
            setIsErrorDetailedModelShowed(false);
          }}
          errorDetail={errorDetail}
          id={id}
          name={name}
          version={version}
          isDeployFailed={state === MODEL_STATE.loadFailed}
        />
      )}
    </>
  );
};
