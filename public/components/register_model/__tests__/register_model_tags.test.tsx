/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '',
  }),
}));

describe('<RegisterModel /> Tags', () => {
  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
  });

  it('should render a tags panel', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    expect(result.tagKeyInput).toBeInTheDocument();
    expect(result.tagValueInput).toBeInTheDocument();
  });

  it('should submit the form without selecting tags', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('should submit the form with selected tags', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    await result.user.type(result.tagKeyInput, 'Key1');
    await result.user.type(result.tagValueInput, 'Value1');

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [{ key: 'Key1', value: 'Value1' }] })
    );
  });

  it('should allow to add multiple tags', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // Add two tags
    await result.user.click(screen.getByText(/add new tag/i));
    await result.user.click(screen.getByText(/add new tag/i));

    expect(
      screen.getAllByText(/select or add a key/i, { selector: '.euiComboBoxPlaceholder' })
    ).toHaveLength(3);

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [
          { key: '', value: '' },
          { key: '', value: '' },
          { key: '', value: '' },
        ],
      })
    );
  });

  it('should allow to remove multiple tags', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    // Add two tags
    await result.user.click(screen.getByText(/add new tag/i));
    await result.user.click(screen.getByText(/add new tag/i));

    expect(
      screen.getAllByText(/select or add a key/i, { selector: '.euiComboBoxPlaceholder' })
    ).toHaveLength(3);

    // Remove 2n tag, and 1st tag
    await result.user.click(screen.getByLabelText(/remove tag at row 2/i));
    await result.user.click(screen.getByLabelText(/remove tag at row 1/i));

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [{ key: '', value: '' }],
      })
    );
  });
});
