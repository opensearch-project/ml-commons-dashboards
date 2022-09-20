import React, { useMemo } from 'react';
import { useRouteMatch, Link, generatePath } from 'react-router-dom';
import {
  EuiPanel,
  EuiPageHeader,
  EuiDescriptionList,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiButton,
} from '@elastic/eui';
import moment from 'moment';

import { APIProvider } from '../../apis/api_provider';
import { routerPaths } from '../../../common/router_paths';
import { useFetcher } from '../../hooks/use_fetcher';

export const ModelDetail = (props: any) => {
  const { params } = useRouteMatch<{ id: string }>();
  const { data: model } = useFetcher(APIProvider.getAPI('model').getOne, params.id);

  const modelDescriptionListItems = useMemo(
    () =>
      model
        ? [
            {
              title: 'ID',
              description: model.id,
            },
            {
              title: 'Name',
              description: model.name,
            },
            {
              title: 'Algorithm',
              description: model.algorithm,
            },
            ...(model.trainTime
              ? [
                  {
                    title: 'Train time',
                    description: moment(model.trainTime).format(),
                  },
                ]
              : []),
            {
              title: 'Context',
              description: JSON.stringify(model.context),
            },
            {
              title: 'Content',
              description: <div style={{ wordBreak: 'break-all' }}>{model.content}</div>,
            },
          ]
        : [],
    [model]
  );

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle="Model Detail"
        rightSideItems={[
          <Link to={generatePath(routerPaths.predict, { id: params.id })}>
            <EuiButton fill>Predict</EuiButton>
          </Link>,
          <Link to={routerPaths.modelList}>
            <EuiButton>Back to list</EuiButton>
          </Link>,
        ]}
        bottomBorder
      />
      <EuiSpacer />

      {model ? (
        <EuiDescriptionList listItems={modelDescriptionListItems} />
      ) : (
        <EuiLoadingSpinner size="xl" />
      )}
    </EuiPanel>
  );
};
