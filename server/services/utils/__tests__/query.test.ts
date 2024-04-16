/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateTermQuery, generateMustQueries } from '../query';

describe('generateTermQuery', () => {
  it('should return consistent result when number value provided', () => {
    expect(generateTermQuery('foo', 1)).toMatchInlineSnapshot(`
      Object {
        "term": Object {
          "foo": Object {
            "value": 1,
          },
        },
      }
    `);
  });
  it('should return consistent result when string value provided', () => {
    expect(generateTermQuery('foo', 'bar')).toMatchInlineSnapshot(`
      Object {
        "term": Object {
          "foo": Object {
            "value": "bar",
          },
        },
      }
    `);
  });
  it('should return consistent result when array value provided', () => {
    expect(generateTermQuery('foo', [1, 'bar'])).toMatchInlineSnapshot(`
      Object {
        "terms": Object {
          "foo": Array [
            1,
            "bar",
          ],
        },
      }
    `);
  });
});

describe('generateMustQueries', () => {
  it('should return consistent result when no query provided', () => {
    expect(generateMustQueries([])).toMatchInlineSnapshot(`
      Object {
        "match_all": Object {},
      }
    `);
  });
  it('should return consistent result when only one query provided', () => {
    expect(generateMustQueries([generateTermQuery('foo', 'bar')])).toMatchInlineSnapshot(`
      Object {
        "term": Object {
          "foo": Object {
            "value": "bar",
          },
        },
      }
    `);
  });
  it('should return consistent result when multi query provided', () => {
    expect(generateMustQueries([generateTermQuery('foo', 'bar'), generateTermQuery('bar', 'baz')]))
      .toMatchInlineSnapshot(`
      Object {
        "bool": Object {
          "must": Array [
            Object {
              "term": Object {
                "foo": Object {
                  "value": "bar",
                },
              },
            },
            Object {
              "term": Object {
                "bar": Object {
                  "value": "baz",
                },
              },
            },
          ],
        },
      }
    `);
  });
});
