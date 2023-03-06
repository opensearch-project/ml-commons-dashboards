/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
// @ts-ignore
import fetch from 'node-fetch';

import { IRouter, opensearchDashboardsResponseFactory } from '../../../../src/core/server';
import {
  MODEL_REPOSITORY_API_ENDPOINT,
  MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT,
} from './constants';

const fetchURLAsJSONData = (url: string) => fetch(url).then((response: any) => response.json());

export const modelRepositoryRouter = (router: IRouter) => {
  router.get({ path: MODEL_REPOSITORY_API_ENDPOINT, validate: false }, async () => {
    try {
      const data = await fetchURLAsJSONData(
        'https://raw.githubusercontent.com/opensearch-project/ml-commons/2.x/ml-algorithms/src/test/resources/org/opensearch/ml/engine/algorithms/text_embedding/pre_trained_models_list.json'
      );
      return opensearchDashboardsResponseFactory.ok({ body: data });
    } catch (error) {
      return opensearchDashboardsResponseFactory.badRequest({ body: error.message });
    }
  });

  router.get(
    {
      path: `${MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT}/{configURL}`,
      validate: {
        params: schema.object({
          configURL: schema.string(),
        }),
      },
    },
    async (_context, request) => {
      try {
        const data = await fetchURLAsJSONData(request.params.configURL);
        return opensearchDashboardsResponseFactory.ok({ body: data });
      } catch (error) {
        return opensearchDashboardsResponseFactory.badRequest({ body: error.message });
      }
    }
  );
};
