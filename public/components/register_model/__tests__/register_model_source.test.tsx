/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setup } from './setup';
import * as formAPI from '../register_model_api';
import { Connector } from '../../../apis/connector';
import { screen } from '../../../../test/test_utils';

describe('<RegisterModel /> Source', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
    jest.spyOn(formAPI, 'submitExternalModel').mockImplementation(onSubmitMock);
    jest.spyOn(Connector.prototype, 'getAll').mockResolvedValue({
      data: [
        { id: 'connector-1', name: 'foo' },
        { id: 'connector-2', name: 'bar' },
      ],
      total_connectors: 2,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a model source panel', async () => {
    const result = await setup({ mode: 'external', route: '/?type=external' });
    expect(result.connectorInput).toBeInTheDocument();
  });

  it('should submit the register model form', async () => {
    const result = await setup({ mode: 'external', route: '/?type=external' });
    expect(onSubmitMock).not.toHaveBeenCalled();

    await result.user.click(result.connectorInput);
    await result.user.click(screen.getByRole('option', { name: 'foo' }));
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should NOT submit the register model form if model source is empty', async () => {
    const result = await setup({ mode: 'external', route: '/?type=external' });

    await result.user.click(result.submitButton);

    expect(result.connectorInput.closest('[class*="isInvalid"]')).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
