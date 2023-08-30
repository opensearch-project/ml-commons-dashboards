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
  planningWorkerNodes: ['node-1', 'node-2', 'node-3'],
};

function setup({ model = MODEL, onClose = jest.fn() }) {
  const user = userEvent.setup({});
  render(<PreviewPanel model={model} onClose={onClose} />);
  return { user };
}

describe('<PreviewPanel />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render id, name in panel', () => {
    setup({});
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('id1')).toBeInTheDocument();
  });

  it('source should be local and should not render connector details when no connector params passed', async () => {
    setup({});
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.queryByText('Connector details')).not.toBeInTheDocument();
  });

  it('source should be external and should not render nodes details when connector params passed', async () => {
    const modelWithConntector = {
      ...MODEL,
      connector: {
        name: 'connector',
      },
    };
    setup({
      model: modelWithConntector,
    });
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.queryByText('Status by node')).not.toBeInTheDocument();
  });

  it('should call onClose when close panel', async () => {
    const onClose = jest.fn();
    const { user } = setup({ onClose });
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('euiFlyoutCloseButton'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should render loading when local model not responding and render partially state when responding', async () => {
    const request = jest.spyOn(APIProvider.getAPI('profile'), 'getModel');
    const mockResult = {
      id: 'model-1-id',
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
      worker_nodes: ['node-1', 'node-2'],
      not_worker_nodes: ['node-3'],
    };
    request.mockResolvedValue(mockResult);
    setup({});
    expect(screen.getByTestId('preview-panel-color-loading-text')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Partially responding')).toBeInTheDocument();
      expect(screen.getByText('Responding on 2 of 3 nodes')).toBeInTheDocument();
    });
  });

  it('should render not responding when no model profile API response', async () => {
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockResolvedValueOnce({});
    setup({});
    await waitFor(() =>
      expect(screen.getByText('Not responding on 3 of 3 nodes')).toBeInTheDocument()
    );
  });

  it('should render not responding when model profile API return no worker nodes', async () => {
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockResolvedValueOnce({
      id: 'model-1-id',
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
      worker_nodes: [],
      not_worker_nodes: ['node-1', 'node-2', 'node-3'],
    });
    setup({});
    await waitFor(() =>
      expect(screen.getByText('Not responding on 3 of 3 nodes')).toBeInTheDocument()
    );
  });

  it('should render responding when model profile API return all worker node responding', async () => {
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockResolvedValueOnce({
      id: 'model-1-id',
      target_worker_nodes: ['node-1', 'node-2', 'node-3'],
      worker_nodes: ['node-1', 'node-2', 'node-3'],
      not_worker_nodes: [],
    });
    setup({});
    await waitFor(() => expect(screen.getByText('Responding on 3 of 3 nodes')).toBeInTheDocument());
  });

  it('should NOT render nodes during model profile API loading', async () => {
    jest.useFakeTimers();
    jest.spyOn(APIProvider.getAPI('profile'), 'getModel').mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'model-1-id',
            target_worker_nodes: ['node-1', 'node-2', 'node-3'],
            worker_nodes: ['node-1'],
            not_worker_nodes: ['node-2', 'node-3'],
          });
        }, 3000);
      })
    );
    setup({});
    expect(screen.queryByText('node-1')).not.toBeInTheDocument();
    expect(screen.queryByText('node-2')).not.toBeInTheDocument();
    expect(screen.queryByText('node-3')).not.toBeInTheDocument();

    jest.advanceTimersByTime(3000);
    jest.useRealTimers();

    waitFor(() => {
      expect(screen.getByText('node-1')).toBeInTheDocument();
      expect(screen.getByText('node-2')).toBeInTheDocument();
      expect(screen.getByText('node-3')).toBeInTheDocument();
    });
  });
});
