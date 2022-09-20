import React from 'react';
import { ResultOverview } from './result_overview';
import { ResultList } from './result_list';
import { IPredictResult } from '../';
import { EuiCallOut, EuiTextColor } from '@elastic/eui';

type Props = IPredictResult;
export const PredictResult = (props: Props) => {
  const { status } = props;
  const renderResult = () => {
    if (status === 'success') {
      const { overview, data } = props;
      return (
        <>
          <ResultOverview rows={overview.rows} columns={overview.columns} />
          <ResultList data={data} />
        </>
      );
    } else if (status === 'fail') {
      const { message } = props;
      return (
        <EuiCallOut title="Predict Error" color="danger" iconType="alert">
          <p>
            The model prediction is failed!.Error message is{' '}
            <EuiTextColor color="danger">{message}</EuiTextColor>.
          </p>
        </EuiCallOut>
      );
    }
    return null;
  };
  return <>{renderResult()}</>;
};
