/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';

describe('<RegisterModel /> Evaluation Metrics', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a evaluation metrics panel', async () => {
    await setup();

    expect(screen.getByLabelText(/^metric$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/training value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/validation value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/testing value/i)).toBeInTheDocument();
  });

  it('should render metric value input as disabled by default', async () => {
    await setup();

    expect(screen.getByLabelText(/training value/i)).toBeDisabled();
    expect(screen.getByLabelText(/validation value/i)).toBeDisabled();
    expect(screen.getByLabelText(/testing value/i)).toBeDisabled();
  });

  it('should render metric value input as enabled after selecting a metric name', async () => {
    const result = await setup();

    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    expect(screen.getByLabelText(/training value/i)).toBeEnabled();
    expect(screen.getByLabelText(/validation value/i)).toBeEnabled();
    expect(screen.getByLabelText(/testing value/i)).toBeEnabled();
  });

  it('should submit the form without selecting metric name', async () => {
    const result = await setup();
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the form if metric name is selected but metric value are empty and error message in screen', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));
    await result.user.click(result.submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
    expect(screen.getByText('At least one value is required. Enter a value')).toBeInTheDocument();
  });

  it('should submit the form if metric name and all metric value are selected', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    await result.user.type(screen.getByLabelText(/training value/i), '1');
    await result.user.type(screen.getByLabelText(/validation value/i), '1');
    await result.user.type(screen.getByLabelText(/testing value/i), '1');

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should submit the form if metric name is selected but metric value are partially selected', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    // Only input Training metric value
    await result.user.type(screen.getByLabelText(/training value/i), '1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the form if metric value < 0', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    // Type an invalid value
    await result.user.type(screen.getByLabelText(/training value/i), '-.1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT submit the form if metric value > 1', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    // Type an invalid value
    await result.user.type(screen.getByLabelText(/training value/i), '1.1');
    await result.user.click(result.submitButton);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should keep metric value not more than 2 decimal point', async () => {
    const result = await setup();
    await result.user.click(screen.getByLabelText(/^metric$/i));
    await result.user.click(screen.getByText('Metric 1'));

    await result.user.type(screen.getByLabelText(/training value/i), '1.111');
    expect(screen.getByLabelText(/training value/i)).toHaveValue(1.11);
  });
});
