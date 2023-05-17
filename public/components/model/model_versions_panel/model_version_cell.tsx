/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { get } from 'lodash';
import { EuiBadge, EuiText } from '@elastic/eui';

import { renderTime } from '../../../utils/table';
import { MODEL_STATE } from '../../../../common';
import { VersionTableDataItem } from '../types';

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
      return <EuiText style={{ color: '#006BB4' }}>{data.version}</EuiText>;
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
      return renderTime(data.lastUpdatedTime, 'MMM D, YYYY h:m A');
    default:
      return get(data, columnId, '-');
  }
};
