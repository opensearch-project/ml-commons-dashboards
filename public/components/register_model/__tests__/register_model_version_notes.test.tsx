/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';

describe('<RegisterModel /> Version notes', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
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

  it('should NOT allow to input a model note which exceed max length: 200', async () => {
    const result = await setup();

    await result.user.clear(result.versionNotesInput);
    await result.user.type(result.versionNotesInput, 'x'.repeat(201));
    expect(result.versionNotesInput.value).toHaveLength(200);
  });
});
