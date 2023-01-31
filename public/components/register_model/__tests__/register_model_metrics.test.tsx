/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';

describe('<RegisterModel /> Evaluation Metrics', () => {
  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
  });

  it('should render a evaluation metrics panel', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    expect(result.metricNameInput).toBeInTheDocument();
    expect(result.trainingMetricValueInput).toBeInTheDocument();
    expect(result.validationMetricValueInput).toBeInTheDocument();
    expect(result.testingMetricValueInput).toBeInTheDocument();
  });

  it('should render metric value input as disabled by default', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    expect(result.trainingMetricValueInput).toBeDisabled();
    expect(result.validationMetricValueInput).toBeDisabled();
    expect(result.testingMetricValueInput).toBeDisabled();
  });

  it('should render metric value input as enabled after selecting a metric name', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));

    expect(result.trainingMetricValueInput).toBeEnabled();
    expect(result.validationMetricValueInput).toBeEnabled();
    expect(result.testingMetricValueInput).toBeEnabled();
  });

  it('should submit the form without selecting metric name', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should submit the form if metric name is selected but metric value are empty', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should submit the form if metric name and all metric value are selected', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));

    await result.user.type(result.trainingMetricValueInput, '1');
    await result.user.type(result.validationMetricValueInput, '1');
    await result.user.type(result.testingMetricValueInput, '1');

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should submit the form if metric name is selected but metric value are partially selected', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));

    // Only input Training metric value
    await result.user.type(result.trainingMetricValueInput, '1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the form if metric value < 0', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));

    // Type an invalid value
    await result.user.type(result.trainingMetricValueInput, '-.1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the form if metric value > 1', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.metricNameInput);
    await result.user.click(screen.getByText('Metric 1'));

    // Type an invalid value
    await result.user.type(result.trainingMetricValueInput, '1.1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
