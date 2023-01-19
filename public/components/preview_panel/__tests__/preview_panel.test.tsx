/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test/test_utils';
import { PreviewPanel } from '../';
import { APIProvider } from '../../../apis/api_provider';

const MODEL = {
  id: 'id1',
  name: 'test',
};

function setup({ onUpdateData = jest.fn(), model = MODEL, onClose = jest.fn() }) {
  const user = userEvent.setup({});
  render(<PreviewPanel model={model} onUpdateData={onUpdateData} onClose={onClose} />);
  return { user };
}

describe('<PreviewPanel />', () => {
  it('should render id and name in panel', () => {
    setup({});
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('id1')).toBeInTheDocument();
  });

  it('should call onClose when close panel', async () => {
    const onClose = jest.fn();
    const { user } = setup({ onClose });
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('euiFlyoutCloseButton'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onUpdate when latest data responds', async () => {
    const onUpdateData = jest.fn();
    const request = jest.spyOn(APIProvider.getAPI('profile'), 'getModel');
    const mockResult = {
      id: 'model-1-id',
      target_node_ids: ['node-1', 'node-2', 'node-3'],
      deployed_node_ids: ['node-1', 'node-2'],
      not_deployed_node_ids: ['node-3'],
    };
    request.mockResolvedValue(mockResult);
    setup({ onUpdateData });
    expect(request).toHaveBeenCalledWith('id1');
    expect(onUpdateData).not.toHaveBeenCalled();
    await waitFor(() => expect(onUpdateData).toHaveBeenCalledWith(mockResult));
  });

  it('should render loading when not responding and render partially state when responding', async () => {
    const onUpdateData = jest.fn();
    const request = jest.spyOn(APIProvider.getAPI('profile'), 'getModel');
    const mockResult = {
      id: 'model-1-id',
      target_node_ids: ['node-1', 'node-2', 'node-3'],
      deployed_node_ids: ['node-1', 'node-2'],
      not_deployed_node_ids: ['node-3'],
    };
    request.mockResolvedValue(mockResult);
    setup({ onUpdateData });
    expect(screen.getByTestId('preview-panel-color-loading-text')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Partially responding on 2 of 3 nodes')).toBeInTheDocument()
    );
  });
});
