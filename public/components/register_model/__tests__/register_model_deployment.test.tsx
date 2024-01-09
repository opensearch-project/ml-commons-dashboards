/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formAPI from '../register_model_api';
import { screen } from '../../../../test/test_utils';

describe('<RegisterModel /> Deployment', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
    jest.spyOn(formAPI, 'submitExternalModel').mockImplementation(onSubmitMock);
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a model deployment panel', async () => {
    await setup();
    expect(screen.getByLabelText('Deployment')).toBeInTheDocument();
  });

  it('should render a model activation panel', async () => {
    await setup({ mode: 'external', route: '/?type=external' });
    expect(screen.getByLabelText('Activation')).toBeInTheDocument();
  });

  it('should submit the register model form without automatic deployment flag', async () => {
    const result = await setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        deployment: false,
      })
    );
  });
  it('should submit the register model form with automatic deployment flag', async () => {
    const result = await setup();
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(screen.getByLabelText('Start deployment automatically'));
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        deployment: true,
      })
    );
  });
});
