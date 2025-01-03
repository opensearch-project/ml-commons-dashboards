/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_VERSION_STATE } from '../../../../common';
import { generateModelVersionSearchQuery } from '../model_version';

describe('generateModelVersionSearchQuery', () => {
  it('should generate consistent query when states provided', () => {
    expect(
      generateModelVersionSearchQuery({
        states: [MODEL_VERSION_STATE.deployed, MODEL_VERSION_STATE.partiallyDeployed],
      })
    ).toMatchInlineSnapshot(`
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
    expect(generateModelVersionSearchQuery({ nameOrId: 'foo' })).toMatchInlineSnapshot(`
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
      generateModelVersionSearchQuery({
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
