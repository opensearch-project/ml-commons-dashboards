/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_STATE } from '../../../../common';
import { generateModelSearchQuery } from '../model';

describe('generateModelSearchQuery', () => {
  it('should generate consistent query when states provided', () => {
    expect(generateModelSearchQuery({ states: [MODEL_STATE.loaded, MODEL_STATE.partiallyLoaded] }))
      .toMatchInlineSnapshot(`
      Object {
        "bool": Object {
          "must": Array [
            Object {
              "terms": Object {
                "model_state": Array [
                  "DEPLOYED",
                  "PARTIALLY_DEPLOYED",
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
      }
    `);
  });
  it('should generate consistent query when nameOrId provided', () => {
    expect(generateModelSearchQuery({ nameOrId: 'foo' })).toMatchInlineSnapshot(`
      Object {
        "bool": Object {
          "must": Array [
            Object {
              "bool": Object {
                "should": Array [
                  Object {
                    "wildcard": Object {
                      "name.keyword": Object {
                        "case_insensitive": true,
                        "value": "*foo*",
                      },
                    },
                  },
                  Object {
                    "term": Object {
                      "_id": Object {
                        "value": "foo",
                      },
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
      }
    `);
  });
  it('should generate consistent query when extraQuery provided', () => {
    expect(
      generateModelSearchQuery({
        extraQuery: {
          bool: {
            must: [
              {
                term: {
                  algorithm: { value: 'REMOTE' },
                },
              },
            ],
          },
        },
      })
    ).toMatchInlineSnapshot(`
      Object {
        "bool": Object {
          "must": Array [
            Object {
              "bool": Object {
                "must": Array [
                  Object {
                    "term": Object {
                      "algorithm": Object {
                        "value": "REMOTE",
                      },
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
      }
    `);
  });
});
