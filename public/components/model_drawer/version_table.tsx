/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useCallback } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { EuiBasicTable } from '@elastic/eui';

import { ModelSearchItem } from '../../apis/model';
import { routerPaths } from '../../../common/router_paths';
import { renderTime } from '../../utils';

export function VersionTable(props: { models: ModelSearchItem[] }) {
  const { models } = props;
  const history = useHistory();
  const columns = useMemo(
    () => [
      {
        field: 'id',
        name: 'ID',
      },
      {
        field: 'name',
        name: 'Name',
      },
      {
        field: 'algorithm',
        name: 'Algorithm',
      },
      {
        field: 'context',
        name: 'Context',
        width: '500px',
      },
      {
        field: 'trainTime',
        name: 'Train Time',
        render: renderTime,
        sortable: true,
      },
    ],
    []
  );
  const rowProps = useCallback(
    ({ id }) => ({
      onClick: () => {
        history.push(generatePath(routerPaths.modelDetail, { id }));
      },
    }),
    [history]
  );

  return <EuiBasicTable columns={columns} items={models} rowProps={rowProps} />;
}
