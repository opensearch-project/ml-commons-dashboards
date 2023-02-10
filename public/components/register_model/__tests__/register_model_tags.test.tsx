/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen, within } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';

describe('<RegisterModel /> Tags', () => {
  beforeEach(() => {
    jest
      .spyOn(formHooks, 'useModelTags')
      .mockReturnValue([false, { keys: ['Key1', 'Key2'], values: ['Value1', 'Value2'] }]);
  });

  it('should render a tags panel', async () => {
    const onSubmitMock = jest.fn();
    await setup({ onSubmit: onSubmitMock });

    const keyContainer = screen.queryByTestId('ml-tagKey1');
    const valueContainer = screen.queryByTestId('ml-tagValue1');

    expect(keyContainer).toBeInTheDocument();
    expect(valueContainer).toBeInTheDocument();
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

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');

    await result.user.type(keyInput, 'Key1');
    await result.user.type(valueInput, 'Value1');

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

  it('should NOT allow to submit tag which does NOT have value', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    // only input key, but NOT value
    await result.user.type(keyInput, 'key 1');
    await result.user.click(result.submitButton);

    // tag value input should be invalid
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).queryByText('A value is required. Enter a value.');
    expect(valueInput).toBeInTheDocument();

    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT allow to submit tag which does NOT have key', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    // only input key, but NOT value
    await result.user.type(valueInput, 'Value 1');
    await result.user.click(result.submitButton);

    // tag value input should be invalid
    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).queryByText('A key is required. Enter a key.');
    expect(keyInput).toBeInTheDocument();

    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should only allow to add maximum 25 tags', async () => {
    const onSubmitMock = jest.fn();
    const result = await setup({ onSubmit: onSubmitMock });
    const MAX_TAG_NUM = 25;

    // It has one tag by default, we can add 24 more tags
    for (let i = 1; i < MAX_TAG_NUM; i++) {
      await result.user.click(screen.getByText(/add new tag/i));
    }

    // 25 tags are displayed
    expect(screen.queryAllByTestId(/ml-tagKey/i)).toHaveLength(25);
    // add new tag button should not be displayed
    expect(screen.queryByText(/add new tag/i)).not.toBeInTheDocument();
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
