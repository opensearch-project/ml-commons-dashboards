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
import { Link, generatePath } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';
import { VersionTable } from './version_table';

interface Props {
  onClose: () => void;
  name: string;
}

export const ModelDrawer = ({ onClose, name }: Props) => {
  const { data: model } = useFetcher(APIProvider.getAPI('model').search, {
    name,
    currentPage: 1,
    pageSize: 50,
  });
  const latestVersion = useMemo(() => {
    //TODO: currently assume that api will return versions in order
    if (model?.data) {
      const data = model.data;
      return data[data.length - 1];
    }
    return { id: '' };
  }, [model]);

  return (
    <EuiFlyout onClose={onClose} hideCloseButton={true}>
      <EuiFlyoutHeader>
        <EuiPageHeader
          pageTitle={name ?? ''}
          rightSideItems={
            latestVersion.id
              ? [
                  <Link to={generatePath(routerPaths.modelDetail, { id: latestVersion.id })}>
                    <EuiButton>View Details</EuiButton>
                  </Link>,
                ]
              : []
          }
        />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {model && <EuiDescriptionList type="row" listItems={[]} />}
        <EuiSpacer size="xl" />
        <EuiTitle size="m">
          <h4>Versions</h4>
        </EuiTitle>
        <VersionTable models={model?.data ?? []} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
