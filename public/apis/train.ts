/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRAIN_API_ENDPOINT } from '../../server/routes/constants';
import { InnerHttpProvider } from './inner_http_provider';
import type { ALGOS } from '../../common/';
import type { Query } from '../../public/components/data/query_field';
import type { InputData } from '../types';

export interface TrainResponse {
  status: string;
  model_id: string;
  message?: string;
}
export type DataSource = 'upload' | 'query';

interface Body {
  parameters: Record<string, string | number>;
  input_query?: Record<string, string | number | string[] | Query>;
  input_index?: string[];
  input_data?: Record<string, string>;
}

export class Train {
  public train(body: Record<string, string[]>, algo: string, async: boolean) {
    return InnerHttpProvider.getHttp().post<TrainResponse>(
      `${TRAIN_API_ENDPOINT}/${algo}/${async}`,
      {
        body: JSON.stringify(body),
      }
    );
  }

  public convertParams(
    algo: ALGOS,
    dataSource: DataSource,
    params: Record<string, string | number>,
    inputData: InputData,
    { fields, query }: { fields: Record<string, string[]>; query: Query | undefined }
  ): Body | {} {
    if (dataSource === 'query') {
      const index = Object.keys(fields)[0];
      if (!index) return {};
      const body: Body = {
        parameters: params,
        input_query: {
          _source: fields[index],
          size: 10000,
        },
        input_index: [index],
      };
      if (query) {
        body.input_query!.query = query;
      }
      return body;
    } else {
      return {
        parameters: params,
        input_data: inputData,
      };
    }
  }
}
