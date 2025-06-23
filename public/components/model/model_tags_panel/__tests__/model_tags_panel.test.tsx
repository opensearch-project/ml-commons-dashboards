/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, waitFor, within } from '../../../../../test/test_utils';
import { ModelTagsPanel } from '../model_tags_panel';

describe('<ModelTagsPanel />', () => {
  it('should render saved tag keys in read-only mode and edit button by default', () => {
    render(
      <ModelTagsPanel
        tagKeys={[{ name: 'Accuracy: Test', type: 'number' }]}
        onTagKeysChange={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Accuracy: Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Accuracy: Test')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Number')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Number')).toHaveAttribute('readonly');
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should show remove saved tag key and add tag key button after edit button clicked', async () => {
    render(
      <ModelTagsPanel
        tagKeys={[{ name: 'Accuracy: Test', type: 'number' }]}
        onTagKeysChange={jest.fn()}
      />
    );

    await userEvent.click(screen.getByText('Edit'));
    expect(screen.getByLabelText('Remove saved tag key at row 1')).toBeInTheDocument();
  });

  it('should call onTagKeysChange after delete tag key confirmation modal confirmed', async () => {
    const onTagKeysChangeMock = jest.fn();
    render(
      <ModelTagsPanel
        tagKeys={[{ name: 'Accuracy: Test', type: 'number' }]}
        onTagKeysChange={onTagKeysChangeMock}
      />
    );

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByLabelText('Remove saved tag key at row 1'));

    expect(onTagKeysChangeMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Delete tag key'));
    expect(onTagKeysChangeMock).toHaveBeenCalledWith([]);
  });

  it('should show "1 unsaved change(s)", discard button and save button after add tag key button clicked', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));

    expect(screen.getByText('1 unsaved change(s)')).toBeInTheDocument();
    expect(screen.getByText('Discard change(s)')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should disable saved tag key in the new tag key dropdown', async () => {
    render(
      <ModelTagsPanel
        tagKeys={[{ name: 'Accuracy: test', type: 'string' }]}
        onTagKeysChange={jest.fn()}
      />
    );

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    expect(screen.getByRole('option', { name: 'Accuracy: test' })).toBeDisabled();
  });

  it('should fill tag key type and set readonly after system exists tag key selected', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));

    expect(
      within(screen.getByTestId('modelTagKeyType1')).getByText('Select a type')
    ).toBeInTheDocument();
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));
    expect(
      within(screen.getByTestId('modelTagKeyType1')).getByDisplayValue('Number')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('modelTagKeyType1')).getByDisplayValue('Number')
    ).toHaveAttribute('readonly');
  });

  it('should show "Tag keys must be unique. Use a unique key." if tag key already exists', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));

    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));

    expect(
      within(screen.getByTestId('modelTagKeyName2')).getByText(
        'Tag keys must be unique. Use a unique key.'
      )
    ).toBeInTheDocument();
  });

  it('should show "Tag keys must be unique. Use a unique key." if outer saved tag keys update and already exists', async () => {
    const { rerender } = render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));

    rerender(
      <ModelTagsPanel tagKeys={[{ name: 'F1', type: 'number' }]} onTagKeysChange={jest.fn()} />
    );

    await waitFor(async () => {
      expect(
        within(screen.getByTestId('modelTagKeyName1')).getByText(
          'Tag keys must be unique. Use a unique key.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should able to create not exists key and change tag type', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));

    await userEvent.type(screen.getByText('Select or add a key'), 'not exists key{Enter}');
    expect(screen.getByText('not exists key')).toBeInTheDocument();
    expect(within(screen.getByTestId('modelTagKeyType1')).getByText('String')).toBeInTheDocument();

    await userEvent.click(within(screen.getByTestId('modelTagKeyType1')).getByText('String'));
    await userEvent.click(screen.getByRole('option', { name: 'Number' }));
    expect(within(screen.getByTestId('modelTagKeyType1')).getByText('Number')).toBeInTheDocument();
  });

  it('should show "80 characters allowed. Use 80 characters or less." if tag key name over 80 characters', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));

    await userEvent.type(screen.getByText('Select or add a key'), `${'x'.repeat(81)}{Enter}`);
    expect(
      within(screen.getByTestId('modelTagKeyName1')).getByText(
        '80 characters allowed. Use 80 characters or less.'
      )
    ).toBeInTheDocument();
  });

  it('should call onTagKeysChange with new added tag keys, hide save button and turn to readonly mode after save button clicked', async () => {
    const onTagKeysChangeMock = jest.fn();
    render(
      <ModelTagsPanel
        tagKeys={[{ name: 'Accuracy: test', type: 'number' }]}
        onTagKeysChange={onTagKeysChangeMock}
      />
    );

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.type(screen.getByText('Select or add a key'), 'not exists key');

    await userEvent.click(screen.getByText('Save'));
    expect(onTagKeysChangeMock).toHaveBeenCalledWith([
      { name: 'Accuracy: test', type: 'number' },
      { name: 'F1', type: 'number' },
      { name: 'not exists key', type: 'string' },
    ]);
    expect(screen.queryByText('Save')).toBeNull();
    expect(screen.queryByText('Edit')).toBeInTheDocument();
  });

  it('should discard new added tag key and hide bottom bar after discard button clicked', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));

    const discardButton = screen.getByText('Discard change(s)');

    await userEvent.click(discardButton);
    expect(screen.queryByText('F1')).toBeNull();
    expect(discardButton).not.toBeInTheDocument();
  });

  it('should hide bottom bar and remove new added tag key after remove one tag key button clicked', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));
    await userEvent.click(screen.getByLabelText('Remove tag key at row 1'));

    expect(screen.queryByText('F1')).toBeNull();
    expect(screen.queryByText('Discard change(s)')).toBeNull();
  });

  it('should show "You can add up to 0 more tags." and disable add more tag key button after 10 tag keys added', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    for (let i = 0; i < 10; i++) {
      await userEvent.click(screen.getByText('Add tag key'));
    }
    expect(screen.getByText('You can add up to 0 more tags.')).toBeInTheDocument();
    expect(screen.getByText('Add tag key').closest('button')).toBeDisabled();
  });

  it('should discard new tag key and turn to read only mode after cancel button clicked', async () => {
    render(<ModelTagsPanel tagKeys={[]} onTagKeysChange={jest.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Add tag key'));
    await userEvent.click(screen.getByText('Select or add a key'));
    await userEvent.click(screen.getByRole('option', { name: 'F1' }));

    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Discard change(s)')).toBeNull();
    expect(screen.queryByText('F1')).toBeNull();
    expect(screen.queryByText('Add tag key')).toBeNull();
  });
});
