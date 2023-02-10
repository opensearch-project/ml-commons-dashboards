/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen, waitFor, within } from '../../../../test/test_utils';
import { setup } from './setup';
import * as formHooks from '../register_model.hooks';

describe('<RegisterModel /> Tags', () => {
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

  it('should submit the form with selected tags', async () => {
    const result = await setup();

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
          { key: '', value: '' },
          { key: '', value: '' },
          { key: '', value: '' },
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

    const valueContainer = screen.getByTestId('ml-tagValue1');
    const valueInput = within(valueContainer).getByRole('textbox');
    // only input value, but NOT key
    await result.user.type(valueInput, 'Value 1');
    await result.user.click(result.submitButton);

    // tag key input should be invalid
    const keyContainer = screen.getByTestId('ml-tagKey1');
    const keyInput = within(keyContainer).queryByText('A key is required. Enter a key.');
    expect(keyInput).toBeInTheDocument();

    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('should NOT allow to submit if it has duplicate tags', async () => {
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

    // input tag key: 'Value 1'
    const valueContainer2 = screen.getByTestId('ml-tagValue2');
    const valueInput2 = within(valueContainer2).getByRole('textbox');
    await result.user.type(valueInput2, 'Value 1');

    await result.user.click(result.submitButton);

    // Display error message
    expect(
      within(keyContainer2).queryByText(
        'This tag has already been added. Remove the duplicate tag.'
      )
    ).toBeInTheDocument();
    // it should not submit the form
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it(
    'should only allow to add maximum 25 tags',
    async () => {
      const result = await setup();
      const MAX_TAG_NUM = 25;

      // It has one tag by default, we can add 24 more tags
      const addNewTagButton = screen.getByText(/add new tag/i);
      for (let i = 1; i < MAX_TAG_NUM; i++) {
        await result.user.click(addNewTagButton);
      }

      // 25 tags are displayed
      waitFor(() => expect(screen.queryAllByTestId(/ml-tagKey/i)).toHaveLength(25));
      // add new tag button should not be displayed
      waitFor(() => expect(screen.getByText(/add new tag/i)).toBeDisabled());
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
        tags: [{ key: '', value: '' }],
      })
    );
  });
});
