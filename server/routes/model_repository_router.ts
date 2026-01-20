/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
// @ts-ignore
import fetch from 'node-fetch';

import { IRouter } from '../../../../src/core/server';
import {
  MODEL_REPOSITORY_API_ENDPOINT,
  MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT,
} from './constants';

const PRE_TRAINED_MODELS_URL =
  'https://raw.githubusercontent.com/opensearch-project/ml-commons/main/ml-algorithms/src/test/resources/org/opensearch/ml/engine/algorithms/text_embedding/pre_trained_models_list.json';

const fetchURLAsJSONData = (url: string) => fetch(url).then((response: any) => response.json());

export const modelRepositoryRouter = (router: IRouter) => {
  router.get(
    { path: MODEL_REPOSITORY_API_ENDPOINT, validate: false },
    async (_context, _request, response) => {
      try {
        const data = await fetchURLAsJSONData(PRE_TRAINED_MODELS_URL);
        return response.ok({ body: data });
      } catch (error) {
        return response.badRequest({ body: error.message });
      }
    }
  );

  router.get(
    {
      path: `${MODEL_REPOSITORY_CONFIG_URL_API_ENDPOINT}/{configURL}`,
      validate: {
        params: schema.object({
          configURL: schema.string(),
        }),
      },
    },
    async (_context, request, response) => {
      try {
        const data = await fetchURLAsJSONData(request.params.configURL);
        return response.ok({ body: data });
      } catch (error) {
        return response.badRequest({ body: error.message });
      }
    }
  );
};
