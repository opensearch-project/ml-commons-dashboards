/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';

describe('<RegisterModel /> Artifact', () => {
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useMetricNames')
      .mockReturnValue([false, ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']]);
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
    jest.spyOn(formHooks, 'useModelUpload').mockReturnValue(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display error call-out', async () => {
    const { user, nameInput, descriptionInput } = await setup();
    await user.clear(nameInput);
    await user.clear(descriptionInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));

    expect(screen.queryByText(/Address errors in the form/i)).toBeInTheDocument();
  });

  it('should not display error call-out after errors been fixed', async () => {
    const { user, nameInput, descriptionInput } = await setup();
    await user.clear(nameInput);
    await user.clear(descriptionInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));

    expect(screen.queryByText(/Address errors in the form/i)).toBeInTheDocument();

    // fix the form errors
    await user.type(nameInput, 'test model name');
    await user.type(descriptionInput, 'test model description');
    expect(screen.queryByText(/Address errors in the form/i)).not.toBeInTheDocument();
  });
});
