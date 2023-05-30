/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { screen, waitFor } from '../../../../test/test_utils';
import { setup } from './setup';
import { ModelVersion } from '../../../../public/apis/model_version';
import * as PluginContext from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import * as formAPI from '../register_model_api';

// Cannot spyOn(PluginContext, 'useOpenSearchDashboards') directly as it results in error:
// TypeError: Cannot redefine property: useOpenSearchDashboards
// So we have to mock the entire module first as a workaround
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../../../../src/plugins/opensearch_dashboards_react/public'),
  };
});

describe('<RegisterModel /> Form', () => {
  const MOCKED_MODEL_ID = 'model_id';
  const addDangerMock = jest.fn();
  const addSuccessMock = jest.fn();
  const onSubmitMock = jest
    .fn()
    .mockResolvedValue({ modelId: MOCKED_MODEL_ID, modelVersionId: 'model_version_id' });

  beforeEach(() => {
    jest.spyOn(PluginContext, 'useOpenSearchDashboards').mockReturnValue({
      services: {
        notifications: {
          toasts: {
            addDanger: addDangerMock,
            addSuccess: addSuccessMock,
          },
        },
      },
    });
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
    jest.spyOn(ModelVersion.prototype, 'uploadChunk').mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should init form when id param in url route', async () => {
    await setup({ route: '/1', mode: 'version' });

    await waitFor(() => {
      expect(screen.getByText<HTMLInputElement>('model1')).toBeInTheDocument();
    });
  });

  it('submit button label should be `Register version` when register new version', async () => {
    await setup({ route: '/1', mode: 'version' });

    expect(screen.getByRole('button', { name: /register version/i })).toBeInTheDocument();
  });

  it('submit button label should be `Register model` when import a model', async () => {
    await setup({
      route: '/?type=import&name=sentence-transformers/all-distilroberta-v1',
      mode: 'import',
    });
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('should call submitModelWithURL with pre-filled model data after register model button clicked', async () => {
    jest.spyOn(formAPI, 'submitModelWithURL').mockImplementation(onSubmitMock);
    const { user } = await setup({
      route: '/?type=import&name=sentence-transformers/all-distilroberta-v1',
      mode: 'import',
    });
    await waitFor(() =>
      expect(screen.getByLabelText<HTMLInputElement>(/^name$/i).value).toEqual(
        'sentence-transformers/all-distilroberta-v1'
      )
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'sentence-transformers/all-distilroberta-v1',
        description:
          'This is a sentence-transformers model: It maps sentences & paragraphs to a 768 dimensional dense vector space and can be used for tasks like clustering or semantic search.',
        modelURL:
          'https://artifacts.opensearch.org/models/ml-models/huggingface/sentence-transformers/all-distilroberta-v1/1.0.1/torch_script/sentence-transformers_all-distilroberta-v1-1.0.1-torch_script.zip',
        configuration: expect.stringContaining('sentence_transformers'),
      })
    );
  });

  it('submit button label should be `Register model` when register new model', async () => {
    await setup();
    expect(screen.getByRole('button', { name: /register model/i })).toBeInTheDocument();
  });

  it('should display number of form errors in form footer', async () => {
    const { user, nameInput } = await setup();
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(screen.queryByText(/1 form error/i)).toBeInTheDocument();

    await user.type(nameInput, 'test model name');
    expect(screen.queryByText(/1 form error/i)).not.toBeInTheDocument();
  });

  it('should call addSuccess to display a success toast', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addSuccessMock).toHaveBeenCalled();
  });

  it('should navigate to model page when submit succeed', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(location.href).toContain(`model-registry/model/${MOCKED_MODEL_ID}`);
  });

  it('should call addDanger to display an error toast', async () => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockRejectedValue(new Error('error'));
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /register model/i }));
    expect(addDangerMock).toHaveBeenCalled();
  });

  it('should call submit with file with provided model id and name', async () => {
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
    const { user } = await setup({ route: '/1', mode: 'version' });
    await user.click(screen.getByRole('button', { name: /register version/i }));

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'model1',
        modelId: '1',
      })
    );
  });
});
