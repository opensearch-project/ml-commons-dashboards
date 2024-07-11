/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DATA_SOURCE_FETCHING_ID,
  DATA_SOURCE_INVALID_ID,
  getDataSourceId,
  isDataSourceCompatible,
} from '../data_source';

describe('getDataSourceId', () => {
  it('should return undefined when data source not enabled', () => {
    expect(getDataSourceId(false, null)).toBe(undefined);
    expect(getDataSourceId(null, null)).toBe(undefined);
  });

  it('should return fetching id when selected data source option is null', () => {
    expect(getDataSourceId(true, null)).toBe(DATA_SOURCE_FETCHING_ID);
  });

  it('should return invalid id when selected data source option is undefined', () => {
    expect(getDataSourceId(true, undefined)).toBe(DATA_SOURCE_INVALID_ID);
  });

  it('should return undefined when selected data source id is empty', () => {
    expect(getDataSourceId(true, { id: '' })).toBe(undefined);
  });

  it('should return selected data source id', () => {
    expect(getDataSourceId(true, { id: 'foo' })).toBe('foo');
  });
});

describe('isDataSourceCompatible', () => {
  it('should return true for compatible data sources', () => {
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: ['opensearch-ml'],
          dataSourceVersion: '2.9.0',
        },
      })
    ).toBe(true);
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: ['opensearch-ml'],
          dataSourceVersion: '2.11.0',
        },
      })
    ).toBe(true);
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: ['opensearch-ml'],
          dataSourceVersion: '2.13.0',
        },
      })
    ).toBe(true);
  });

  it('should return false for un-compatible data sources', () => {
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: [],
          dataSourceVersion: '2.13.0',
        },
      })
    ).toBe(false);
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: ['opensearch-jetty'],
          dataSourceVersion: '2.13.0',
        },
      })
    ).toBe(false);
    expect(
      isDataSourceCompatible({
        attributes: {},
      })
    ).toBe(false);
    expect(
      isDataSourceCompatible({
        attributes: {
          installedPlugins: ['opensearch-ml'],
          dataSourceVersion: '2.7.0',
        },
      })
    ).toBe(false);
  });
});
