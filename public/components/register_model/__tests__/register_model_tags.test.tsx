/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen, waitFor, within } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';
import * as formAPI from '../register_model_api';

describe('<RegisterModel /> Tags', () => {
  const onSubmitMock = jest.fn().mockResolvedValue('model_id');

  beforeEach(() => {
    jest.spyOn(formHooks, 'useModelTags').mockReturnValue([
      false,
      [
        { name: 'Key1', type: 'string', values: ['Value1'] },
        { name: 'Key2', type: 'number', values: [0.95] },
      ],
    ]);
    jest.spyOn(formAPI, 'submitModelWithFile').mockImplementation(onSubmitMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a tags panel', async () => {
    await setup();

    const keyContainer = screen.queryByTestId('ml-tagKey1');
    const valueContainer = screen.queryByTestId('ml-tagValue1');

    expect(keyContainer).toBeInTheDocument();
    expect(valueContainer).toBeInTheDocument();
  });

  it('should submit the form without selecting tags', async () => {
    const result = await setup();
    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalled();
  });

  it('tag value input should be disabled if tag key is empty', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    expect(valueInput).toBeDisabled();

    await result.user.type(keyInput, 'Key1{enter}');
    expect(valueInput).toBeEnabled();
  });

  it('should submit the form with selected tags', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');

    await result.user.type(keyInput, 'Key1{enter}');
    await result.user.type(valueInput, 'Value1{enter}');

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [{ key: 'Key1', value: 'Value1', type: 'string' }] })
    );
  });

  it('should allow to add multiple tags', async () => {
    const result = await setup();

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
          { key: '', value: '', type: 'string' },
          { key: '', value: '', type: 'string' },
          { key: '', value: '', type: 'string' },
        ],
      })
    );
  });

  it('should NOT allow to submit tag which does NOT have value', async () => {
    const result = await setup();

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
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.type(keyInput, 'Key1{enter}');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    // Input value, then clear key
    await result.user.type(valueInput, 'Value 1');
    await result.user.click(within(keyContainer).getByLabelText('Clear input'));

    await result.user.click(result.submitButton);

    // tag key input should be invalid
    expect(within(keyContainer).queryByText('A key is required. Enter a key.')).toBeInTheDocument();

    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT allow to submit if it has duplicate tags key', async () => {
    const result = await setup();

    // input tag key: 'Key 1'
    const keyContainer1 = screen.getByTestId('ml-tagKey1');
    const keyInput1 = within(keyContainer1).getByRole('textbox');
    await result.user.type(keyInput1, 'Key 1');

    // input tag key: 'Value 1'
    const valueContainer1 = screen.getByTestId('ml-tagValue1');
    const valueInput1 = within(valueContainer1).getByRole('textbox');
    await result.user.type(valueInput1, 'Value 1');

    // Add a new tag, and input the same tag key and value
    await result.user.click(screen.getByText(/add new tag/i));
    // input tag key: 'Key 1'
    const keyContainer2 = screen.getByTestId('ml-tagKey2');
    const keyInput2 = within(keyContainer2).getByRole('textbox');
    await result.user.type(keyInput2, 'Key 1');

    // input tag key: 'Value 2'
    const valueContainer2 = screen.getByTestId('ml-tagValue2');
    const valueInput2 = within(valueContainer2).getByRole('textbox');
    await result.user.type(valueInput2, 'Value 2');

    await result.user.click(result.submitButton);

    // Display error message
    expect(
      within(keyContainer2).queryByText('Tag keys must be unique. Use a unique key.')
    ).toBeInTheDocument();
    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it(
    'should only allow to add maximum 10 tags',
    async () => {
      const result = await setup();
      const MAX_TAG_NUM = 10;

      // It has one tag by default, we can add 24 more tags
      const addNewTagButton = screen.getByText(/add new tag/i);
      for (let i = 1; i < MAX_TAG_NUM; i++) {
        await result.user.click(addNewTagButton);
      }

      // 10 tags are displayed
      await waitFor(() => expect(screen.queryAllByTestId(/ml-tagKey/i)).toHaveLength(10));
      // add new tag button should not be displayed
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /add new tag/i })).toBeDisabled()
      );
    },
    // The test will fail due to timeout as we interact with the page a lot(24 button click to add new tags)
    // So we try to increase test running timeout to 60000ms to mitigate the timeout issue
    60 * 1000
  );

  it('should allow to remove multiple tags', async () => {
    const result = await setup();

    // Add two tags
    await result.user.click(screen.getByText(/add new tag/i));
    await result.user.click(screen.getByText(/add new tag/i));

    expect(
      screen.getAllByText(/select or add a key/i, { selector: '.euiComboBoxPlaceholder' })
    ).toHaveLength(3);

    // Remove 2n tag, and 1st tag
    await result.user.click(screen.getByLabelText(/remove tag at row 2/i));
    await result.user.click(screen.getByLabelText(/remove tag at row 1/i));

    // should have only one tag left
    await waitFor(() => expect(screen.queryAllByTestId(/ml-tagKey/i)).toHaveLength(1));

    await result.user.click(result.submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [{ key: '', value: '', type: 'string' }],
      })
    );
  });

  it('should allow adding one more tag when registering new version if model group has only two tags', async () => {
    jest.spyOn(formHooks, 'useModelTags').mockReturnValue([
      false,
      [
        { name: 'Key1', type: 'string', values: ['Value1'] },
        { name: 'Key2', type: 'number', values: [0.95] },
      ],
    ]);

    const result = await setup({
      route: '/foo',
      mode: 'version',
    });

    await result.user.click(screen.getByText(/add new tag/i));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /add new tag/i })).toBeDisabled()
    );
  });

  it('should prevent creating new tag key when registering new version', async () => {
    const result = await setup({
      route: '/foo',
      mode: 'version',
    });

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.type(keyInput, 'foo{enter}');
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'strong' &&
          content === 'foo' &&
          element?.nextSibling?.textContent?.trim() === "doesn't match any options"
        );
      })
    ).toBeInTheDocument();
  });

  it('should display error when creating new tag key with more than 80 characters', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.type(keyInput, `${'x'.repeat(81)}{enter}`);
    expect(
      within(keyContainer).queryByText('80 characters allowed. Use 80 characters or less.')
    ).toBeInTheDocument();
  });

  it('should display error when creating new tag value with more than 80 characters', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.type(keyInput, 'dummy key{enter}');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    await result.user.type(valueInput, `${'x'.repeat(81)}{enter}`);
    expect(
      within(valueContainer).queryByText('80 characters allowed. Use 80 characters or less.')
    ).toBeInTheDocument();
  });

  it('should display "No keys found" and "No values found" if no tag keys and no tag values are provided', async () => {
    jest.spyOn(formHooks, 'useModelTags').mockReturnValue([false, []]);

    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.click(keyInput);
    expect(screen.getByText('No keys found. Add a key.')).toBeInTheDocument();

    await result.user.type(keyInput, 'dummy key{enter}');

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    await result.user.click(valueInput);
    expect(screen.getByText('No values found. Add a value.')).toBeInTheDocument();
  });

  it('should NOT display "Key1" in the option list after "Key1" selected', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).getByRole('textbox');
    await result.user.click(keyInput);
    const optionListContainer = screen.getByTestId('comboBoxOptionsList');
    expect(within(optionListContainer).getByTitle('Key1')).toBeInTheDocument();

    await result.user.click(within(optionListContainer).getByTitle('Key1'));
    expect(within(optionListContainer).queryByTitle('Key1')).toBe(null);
  });

  it('should not allow to select tag type if selected an existed tag', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const keyInput = within(keyContainer).getByRole('textbox');

    await result.user.click(keyInput);
    // selected an existed tag
    await result.user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Key1'));

    expect(within(valueContainer).queryByLabelText('select tag type')).not.toBeInTheDocument();
  });

  it('should display a list of tag value for selection after selecting a tag key', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const keyInput = within(keyContainer).getByRole('textbox');
    const valueInput = within(valueContainer).getByRole('textbox');

    await result.user.click(keyInput);
    // selected an existed tag
    await result.user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Key1'));

    await result.user.click(valueInput);
    expect(
      within(screen.getByTestId('comboBoxOptionsList')).queryByTitle('Value1')
    ).toBeInTheDocument();
  });

  it('should clear the tag input when click remove button if there is only one tag', async () => {
    const result = await setup();

    const keyContainer = screen.getByTestId('ml-tagKey1');
    const valueContainer = screen.getByTestId('ml-tagValue1');
    const keyInput = within(keyContainer).getByRole('textbox');
    const valueInput = within(valueContainer).getByRole('textbox');

    await result.user.click(keyInput);
    // selected an existed tag
    await result.user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Key1'));

    await result.user.click(valueInput);
    await result.user.click(within(screen.getByTestId('comboBoxOptionsList')).getByTitle('Value1'));

    expect(screen.queryByText('Key1', { selector: '.euiComboBoxPill' })).toBeInTheDocument();
    expect(screen.queryByText('Value1', { selector: '.euiComboBoxPill' })).toBeInTheDocument();

    await result.user.click(screen.getByLabelText(/remove tag at row 1/i));
    expect(screen.queryByText('Key1', { selector: '.euiComboBoxPill' })).not.toBeInTheDocument();
    expect(screen.queryByText('Value1', { selector: '.euiComboBoxPill' })).not.toBeInTheDocument();
  });
});
