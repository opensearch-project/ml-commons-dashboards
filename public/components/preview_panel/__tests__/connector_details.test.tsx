/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { ConnectorDetails } from '../connector_details';

function setup({ name = 'name', id = 'id', description = 'description' }) {
  const user = userEvent.setup({});
  render(<ConnectorDetails name={name} id={id} description={description} />);
  return { user };
}

describe('<ConnectorDetails />', () => {
  it('should render connector details', () => {
    setup({});
    expect(screen.getByText('Connector name')).toBeInTheDocument();
    expect(screen.getByText('Connector ID')).toBeInTheDocument();
    expect(screen.getByText('Connector description')).toBeInTheDocument();
  });

  it('should render - when id is empty', () => {
    setup({ id: '' });
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByTestId('copyable-text-div')).not.toBeInTheDocument();
  });

  it('should render id and copy id button when id is not empty', () => {
    setup({ id: 'connector-id' });
    expect(screen.getByText('connector-id')).toBeInTheDocument();
    expect(screen.queryByTestId('copyable-text-div')).toBeInTheDocument();
  });
});
