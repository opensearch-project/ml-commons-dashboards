/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  EuiButton,
  EuiTitle,
  EuiSelect,
  EuiSpacer,
  EuiPageHeader,
  EuiRadioGroup,
} from '@elastic/eui';
import { SUPPORTED_ALGOS, ALGOS } from '../../../common/algo';
import { APIProvider } from '../../apis/api_provider';
import { ComponentsCommonProps } from '../app';
import { transParsedDataToInputData } from '../../../public/utils';
import { ParsedResult, QueryField, Query, UploadFile } from '../data';
import { useIndexPatterns } from '../../hooks';
import type { DataSource } from '../../apis/train';
import './index.scss';
import { TrainResult } from './train_result';
import { TrainForm } from './train_form';
import { ParsedData } from '../../types';

type Props = ComponentsCommonProps;

export interface TrainingResult {
  status: 'success' | 'fail' | '';
  id?: string;
  message?: string;
}

export const Train = ({ data }: Props) => {
  const [selectedAlgo, setSelectedAlgo] = useState<ALGOS>('kmeans');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCols, setSelectedCols] = useState<number[]>([0, 1]);
  const [dataSource, setDataSource] = useState<DataSource>('upload');
  const { indexPatterns } = useIndexPatterns(data);
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState<Query>();
  const [trainingResult, setTrainingResult] = useState<TrainingResult>({ status: '' });

  const generateDefaultParams = useCallback((algo: string) => {
    const result: Record<string, string | number> = {};
    const selectAlgo = SUPPORTED_ALGOS.find((item) => item.value === algo);
    selectAlgo?.parameters?.forEach((item) => {
      result[item.name] = item.default;
    });
    return result;
  }, []);
  const defaultParams = generateDefaultParams('kmeans');
  const [params, setParams] = useState<Record<string, string | number>>(defaultParams);

  const [parsedData, setParsedData] = useState<ParsedData>({
    data: [],
    errors: [],
    meta: { delimiter: '', linebreak: '', aborted: false, truncated: false, cursor: 0 },
  });

  const handleSelectAlgo = (algo: ALGOS) => {
    setSelectedAlgo(algo);
    setParams(generateDefaultParams(algo));
  };

  const handleBuild = useCallback(
    async (e) => {
      setTrainingResult({ status: '', id: '', message: '' });
      setIsLoading(true);
      e.preventDefault();
      const inputData = transParsedDataToInputData(parsedData, selectedCols);
      let result;
      try {
        const body = APIProvider.getAPI('train').convertParams(
          selectedAlgo,
          dataSource,
          params,
          inputData,
          { fields: selectedFields, query }
        );
        result = await APIProvider.getAPI('train').train(body, selectedAlgo, false);
        const { status, model_id: modelId, message } = result;
        if (status === 'COMPLETED') {
          setTrainingResult({ status: 'success', id: modelId });
        } else if (message) {
          setTrainingResult({ status: 'fail', message });
        }
      } catch (error) {
        // TODO: handle train error here
        // eslint-disable-next-line no-console
        console.log('error', error);
      }
      setIsLoading(false);
    },
    [params, selectedAlgo, selectedFields, parsedData, selectedCols, dataSource, query]
  );
  return (
    <>
      <EuiPageHeader pageTitle="Train model" bottomBorder />
      <div className="ml-train-form">
        <EuiTitle size="xs">
          <h4>Select a algorithm</h4>
        </EuiTitle>
        <EuiSelect
          onChange={(e) => {
            handleSelectAlgo(e.target.value as ALGOS);
          }}
          value={selectedAlgo}
          fullWidth
          options={SUPPORTED_ALGOS.map((item) => ({ value: item.value, text: item.text }))}
        />
        <EuiSpacer />
        <EuiTitle size="xs">
          <h4>Parameters</h4>
        </EuiTitle>
        <TrainForm params={params} setParams={setParams} algo={selectedAlgo} />
        <EuiSpacer />
        <EuiTitle size="xs">
          <h4>Training Data</h4>
        </EuiTitle>
        <EuiRadioGroup
          options={[
            {
              id: 'upload',
              label: 'Upload File',
            },
            {
              id: 'query',
              label: 'Query From OpenSearch',
            },
          ]}
          idSelected={dataSource}
          onChange={(id) => setDataSource(id as DataSource)}
        />
        <EuiSpacer />
        {dataSource === 'upload' ? (
          <>
            <UploadFile updateParsedData={setParsedData} />
            {parsedData?.data?.length > 0 ? (
              <ParsedResult
                parsedData={parsedData}
                selectedCols={selectedCols}
                onChangeSelectedCols={setSelectedCols}
              />
            ) : null}
          </>
        ) : (
          <QueryField
            indexPatterns={indexPatterns}
            selectedFields={selectedFields}
            onSelectedFields={setSelectedFields}
            onUpdateQuerys={setQuery}
          />
        )}
        <EuiSpacer />
        <EuiButton color="primary" fill onClick={handleBuild} isLoading={isLoading}>
          Build Model
        </EuiButton>
        <TrainResult trainingResult={trainingResult} />
      </div>
    </>
  );
};
