/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';

describe('<RegisterModel /> Version notes', () => {
  const onSubmitMock = jest.fn();

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

  it('should render a version notes panel', async () => {
    const result = await setup();
    expect(result.versionNotesInput).toBeInTheDocument();
  });

  it('should submit the form without fill version notes', async () => {
    const result = await setup();
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model version notes length exceed 200', async () => {
    const result = await setup();

    await result.user.clear(result.versionNotesInput);
    await result.user.type(result.versionNotesInput, 'x'.repeat(200));
    expect(result.versionNotesInput).toBeValid();

    await result.user.clear(result.versionNotesInput);
    await result.user.type(result.versionNotesInput, 'x'.repeat(201));
    expect(result.versionNotesInput).toBeInvalid();

    await result.user.click(result.submitButton);
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
