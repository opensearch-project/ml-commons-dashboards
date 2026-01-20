/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelVersionService } from '../model_version_service';

const createTransportMock = () => ({
  request: jest.fn().mockResolvedValue({
    body: {
      hits: {
        hits: [{ _id: 'model-1', _source: { name: 'Model 1' } }],
        total: {
          value: 1,
        },
      },
    },
  }),
});

describe('ModelVersionService', () => {
  it('should call transport request with consistent params', () => {
    const mockTransport = createTransportMock();
    ModelVersionService.search({
      from: 0,
      size: 1,
      transport: mockTransport,
    });

    expect(mockTransport.request).toHaveBeenCalledTimes(1);
    expect(mockTransport.request.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "body": Object {
            "from": 0,
            "query": Object {
              "bool": Object {
                "must": Array [],
                "must_not": Object {
                  "exists": Object {
                    "field": "chunk_number",
                  },
                },
              },
            },
            "size": 1,
          },
          "method": "POST",
          "path": "/_plugins/_ml/models/_search",
        },
      ]
    `);
  });

  it('should call transport request with sort params', () => {
    const mockTransport = createTransportMock();
    ModelVersionService.search({
      from: 0,
      size: 1,
      transport: mockTransport,
      sort: ['id-asc'],
    });

    expect(mockTransport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          sort: [{ _id: 'asc' }],
        }),
      })
    );
  });

  it('should return consistent results', async () => {
    const result = await ModelVersionService.search({
      from: 0,
      size: 1,
      transport: createTransportMock(),
    });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "data": Array [
          Object {
            "id": "model-1",
            "model_id": undefined,
            "name": "Model 1",
          },
        ],
        "total_model_versions": 1,
      }
    `);
  });
});
