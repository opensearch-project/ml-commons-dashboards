import React, { useMemo } from 'react';
import { EuiFormRow, EuiFieldNumber, EuiSelect, EuiFieldText } from '@elastic/eui';
import { AlgosFormParam, ALGOS_PARAMS, SUPPORTED_ALGOS } from '../../../common/algo';

type Props = {
  params: Record<string, string | number>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  algo: string;
};

export const TrainForm = ({ params, setParams, algo }: Props) => {
  const ALGOS_CONFIGS = useMemo(
    () => SUPPORTED_ALGOS.find((item) => item.value === algo)?.parameters as ALGOS_PARAMS,
    [algo]
  );
  const renderRow = (item: AlgosFormParam) => {
    switch (item.type) {
      case 'integer':
        return (
          <EuiFieldNumber
            fullWidth
            value={params[item.name] ?? item.default}
            onChange={(e) => setParams({ ...params, [item.name]: Number(e.target.value) })}
          />
        );
      case 'enum':
        return (
          <EuiSelect
            fullWidth
            onChange={(e) => setParams({ ...params, [item.name]: e.target.value })}
            value={params[item.name] ?? item.default}
            options={item.group.map((item) => ({ value: item, text: item }))}
          />
        );
      case 'string':
        return (
          <EuiFieldText
            fullWidth
            onChange={(e) => setParams({ ...params, [item.name]: e.target.value })}
            value={params[item.name] ?? item.default}
          />
        );
      default:
        return <></>;
    }
  };
  return (
    <>
      {ALGOS_CONFIGS?.map((item) => {
        return (
          <EuiFormRow label={item.name} fullWidth helpText={item.description ?? ''}>
            {renderRow(item as AlgosFormParam)}
          </EuiFormRow>
        );
      })}
    </>
  );
};
