/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

import { APIProvider } from '../apis/api_provider';
import { ModelSearchItem } from '../apis/model';

const loadModelById = async (id: string) => {
  const { data } = await APIProvider.getAPI('model').search({
    ids: [id],
    currentPage: 1,
    pageSize: 1,
  });
  return data[0];
};

export const useModel = (modelId: string) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ModelSearchItem>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    loadModelById(modelId)
      .then((res) => {
        setLoading(false);
        setData(res);
      })
      .catch((e) => {
        setLoading(false);
        setError(e);
      });
  }, [modelId]);

  return { data, loading, error };
};
