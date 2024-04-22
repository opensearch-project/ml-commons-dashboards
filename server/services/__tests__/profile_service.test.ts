/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProfileService } from '../profile_service';

const createTransportMock = (result?: unknown) => ({
  request: jest.fn().mockResolvedValue(
    result || {
      body: {
        models: {
          'model-1': {
            name: 'Model 1',
            target_worker_nodes: ['node-1', 'node-2'],
            worker_nodes: ['node-1'],
          },
        },
      },
    }
  ),
});

describe('ProfileService', () => {
  it('should call transport request with consistent params', () => {
    const mockTransport = createTransportMock();
    ProfileService.getModel({
      transport: mockTransport,
      modelId: 'model-1',
    });

    expect(mockTransport.request).toHaveBeenCalledTimes(1);
    expect(mockTransport.request.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "method": "GET",
          "path": "/_plugins/_ml/profile/models/model-1?view=model",
        },
      ]
    `);
  });

  it('should return empty object when models not exists in response', async () => {
    const result = await ProfileService.getModel({
      modelId: 'model-1',
      transport: createTransportMock({ body: {} }),
    });

    expect(result).toEqual({});
  });

  it('should return consistent results', async () => {
    const result = await ProfileService.getModel({
      modelId: 'model-1',
      transport: createTransportMock(),
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "id": "model-1",
        "not_worker_nodes": Array [
          "node-2",
        ],
        "target_worker_nodes": Array [
          "node-1",
          "node-2",
        ],
        "worker_nodes": Array [
          "node-1",
        ],
      }
    `);
  });
});
