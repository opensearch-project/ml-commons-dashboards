import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { StatusFilter } from '../';

async function setup({ onUpdateFilters = jest.fn() }) {
  const user = userEvent.setup({});
  render(<StatusFilter onUpdateFilters={onUpdateFilters} />);
  // open popover
  await user.click(screen.getByLabelText('Status'));
  return { user };
}

describe('<StatusFilter />', () => {
  it('should render a dialog with three default items', async () => {
    await setup({});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Responding')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Partially Responding')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Not Responding')).toBeInTheDocument();
  });

  it('should render null content when input a invalid text to search', async () => {
    const { user } = await setup({});
    await user.type(screen.getByPlaceholderText('Search'), '1');
    expect(screen.getByDisplayValue('No filters found')).toBeInTheDocument();
  });

  it('should call `onUpdateFilters` callback when close popover', async () => {
    const onUpdateFilters = jest.fn();
    const { user } = await setup({ onUpdateFilters });
    expect(onUpdateFilters).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText('Monitoring'));
    expect(onUpdateFilters).toHaveBeenCalled();
  });
});
