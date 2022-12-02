/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiButton,
  EuiTitle,
  EuiPageHeader,
  EuiSpacer,
  EuiDescriptionList,
} from '@elastic/eui';
import { APIProvider } from '../../apis/api_provider';
import { useFetcher } from '../../hooks/use_fetcher';
import moment from 'moment';
import { Link, generatePath } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';
import { VersionTable } from './version_table';

interface Props {
  onClose: () => void;
  id: string;
}

export const ModelDrawer = ({ onClose, id }: Props) => {
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, id);

  const modelDescriptionListItems = useMemo(
    () =>
      model
        ? [
            {
              title: 'ID',
              description: model.id,
            },
            {
              title: 'Algorithm',
              description: model.algorithm,
            },
            {
              title: 'State',
              description: model.state,
            },
            ...(model.trainTime
              ? [
                  {
                    title: 'Train time',
                    description: moment(model.trainTime).format(),
                  },
                ]
              : []),
          ]
        : [],
    [model]
  );
  return (
    <EuiFlyout onClose={onClose} hideCloseButton={true}>
      <EuiFlyoutHeader>
        <EuiPageHeader
          pageTitle={model?.name ?? ''}
          rightSideItems={[
            <Link to={generatePath(routerPaths.modelDetail, { id })}>
              <EuiButton>View Details</EuiButton>
            </Link>,
          ]}
        />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {model && <EuiDescriptionList type="row" listItems={modelDescriptionListItems} />}
        <EuiSpacer size="xl" />
        <EuiTitle size="m">
          <h4>Versions</h4>
        </EuiTitle>
        <VersionTable models={[]} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
