/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConnectorService } from '../connector_service';

const CONNECTOR_SEARCH_RESULT_MOCK = {
  body: {
    hits: {
      hits: [{ _id: 'connector-1', _source: { name: 'Connector 1' } }],
      total: {
        value: 1,
      },
    },
  },
};

const MODEL_SEARCH_RESULT_MOCK = {
  body: {
    hits: {
      hits: [
        {
          _id: 'model-1',
          _source: {
            connector: {
              name: 'Connector 1',
            },
          },
        },
        {
          _id: 'model-2',
          _source: {
            connector: {
              name: 'Connector 2',
            },
          },
        },
        {
          _id: 'model-3',
          _source: {
            connector: {
              name: 'Connector 2',
            },
          },
        },
        {
          _id: 'model-4',
          _source: {
            connector: {
              name: 'Connector 3',
            },
          },
        },
      ],
      total: {
        value: 4,
      },
    },
  },
};

const createMockTransport = (result: unknown) => ({
  request: jest.fn().mockResolvedValue(result),
});

describe('ConnectorService', () => {
  describe('search', () => {
    it('should call transport request with consistent params', () => {
      const mockTransport = createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK);
      ConnectorService.search({
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
                "match_all": Object {},
              },
              "size": 1,
            },
            "method": "POST",
            "path": "/_plugins/_ml/connectors/_search",
          },
        ]
      `);
    });

    it('should return consistent results', async () => {
      const result = await ConnectorService.search({
        from: 0,
        size: 1,
        transport: createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK),
      });

      expect(result).toMatchInlineSnapshot(`
              Object {
                "data": Array [
                  Object {
                    "id": "connector-1",
                    "name": "Connector 1",
                  },
                ],
                "total_connectors": 1,
              }
          `);
    });

    it('should return empty results when transport request throw index_not_found_exception', async () => {
      const mockTransport = createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK);
      mockTransport.request.mockImplementationOnce(() => {
        throw new Error('index_not_found_exception');
      });

      const result = await ConnectorService.search({
        from: 0,
        size: 1,
        transport: mockTransport,
      });

      expect(result).toEqual({
        data: [],
        total_connectors: 0,
      });
    });

    it('should throw unexpected error', async () => {
      const mockTransport = createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK);
      const unexpectedError = new Error('unexpected');
      mockTransport.request.mockImplementationOnce(() => {
        throw unexpectedError;
      });

      let error;
      try {
        await ConnectorService.search({
          from: 0,
          size: 1,
          transport: mockTransport,
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe(unexpectedError);
    });
  });
  describe('getUniqueInternalConnectorNames', () => {
    it('should call transport request with consistent params', () => {
      const mockTransport = createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK);
      ConnectorService.getUniqueInternalConnectorNames({
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
                  "must": Array [
                    Object {
                      "bool": Object {
                        "must": Array [
                          Object {
                            "exists": Object {
                              "field": "connector.name",
                            },
                          },
                        ],
                      },
                    },
                  ],
                  "must_not": Object {
                    "exists": Object {
                      "field": "chunk_number",
                    },
                  },
                },
              },
              "size": 10000,
            },
            "method": "POST",
            "path": "/_plugins/_ml/models/_search",
          },
        ]
      `);
    });

    it('should return consistent results', async () => {
      const result = await ConnectorService.getUniqueInternalConnectorNames({
        size: 2,
        transport: createMockTransport(MODEL_SEARCH_RESULT_MOCK),
      });

      expect(result).toMatchInlineSnapshot(`
        Array [
          "Connector 1",
          "Connector 2",
        ]
      `);
    });

    it('should return empty results when no aggregations results', async () => {
      const mockTransport = createMockTransport({
        body: {},
      });
      mockTransport.request.mockImplementationOnce(() => {
        throw new Error('index_not_found_exception');
      });

      const result = await ConnectorService.getUniqueInternalConnectorNames({
        size: 1,
        transport: mockTransport,
      });

      expect(result).toEqual([]);
    });

    it('should return empty results when transport request throw index_not_found_exception', async () => {
      const mockTransport = createMockTransport(MODEL_SEARCH_RESULT_MOCK);
      mockTransport.request.mockImplementationOnce(() => {
        throw new Error('index_not_found_exception');
      });

      const result = await ConnectorService.getUniqueInternalConnectorNames({
        size: 1,
        transport: mockTransport,
      });

      expect(result).toEqual([]);
    });

    it('should throw unexpected error', async () => {
      const mockTransport = createMockTransport(CONNECTOR_SEARCH_RESULT_MOCK);
      const unexpectedError = new Error('unexpected');
      mockTransport.request.mockImplementationOnce(() => {
        throw unexpectedError;
      });

      let error;
      try {
        await ConnectorService.getUniqueInternalConnectorNames({
          size: 1,
          transport: mockTransport,
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe(unexpectedError);
    });
  });
});
