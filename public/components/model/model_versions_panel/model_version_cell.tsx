/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { get } from 'lodash';
import { EuiBadge, EuiLink, EuiText } from '@elastic/eui';
import { Link, generatePath } from 'react-router-dom';

import { MODEL_STATE, routerPaths } from '../../../../common';
import { VersionTableDataItem } from '../types';
import { UiSettingDateFormatTime } from '../../common';

import { ModelVersionStatusCell } from './model_version_status_cell';
import { ModelVersionStatusDetail } from './model_version_status_detail';

interface ModelVersionCellProps {
  columnId: string;
  data: VersionTableDataItem;
  isDetails: boolean;
}

export const ModelVersionCell = ({ data, columnId, isDetails }: ModelVersionCellProps) => {
  if (columnId === 'status' && isDetails) {
    return (
      <ModelVersionStatusDetail
        id={data.id}
        name={data.name}
        version={data.version}
        state={data.state}
        createdTime={data.createdTime}
        lastRegisteredTime={data.lastRegisteredTime}
        lastDeployedTime={data.lastDeployedTime}
        lastUndeployedTime={data.lastUndeployedTime}
      />
    );
  }
  switch (columnId) {
    case 'version':
      return (
        <Link to={generatePath(routerPaths.modelVersion, { id: data.id })}>
          <EuiLink>{data.version}</EuiLink>
        </Link>
      );
    case 'status': {
      return <ModelVersionStatusCell state={data.state} />;
    }
    case 'state': {
      const deployed =
        data.state === MODEL_STATE.loaded || data.state === MODEL_STATE.partiallyLoaded;
      return (
        <EuiBadge color={deployed ? '#E0E5EE' : 'hollow'}>
          {deployed ? 'Deployed' : 'Not deployed'}
        </EuiBadge>
      );
    }
    case 'lastUpdatedTime':
      return <UiSettingDateFormatTime time={data.lastUpdatedTime} />;
    default:
      return get(data, columnId, '-');
  }
};
