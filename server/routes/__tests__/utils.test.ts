/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getOpenSearchClientTransport } from '../utils';
import { coreMock } from '../../../../../src/core/server/mocks';

describe('getOpenSearchClientTransport', () => {
  it('should return current user opensearch transport', async () => {
    const core = coreMock.createRequestHandlerContext();

    expect(await getOpenSearchClientTransport({ context: { core } })).toBe(
      core.opensearch.client.asCurrentUser.transport
    );
  });
  it('should data source id related opensearch transport', async () => {
    const transportMock = {};
    const core = coreMock.createRequestHandlerContext();
    const context = {
      core,
      dataSource: {
        opensearch: {
          getClient: async (_dataSourceId: string) => ({
            transport: transportMock,
          }),
        },
      },
    };

    expect(await getOpenSearchClientTransport({ context, dataSourceId: 'foo' })).toBe(
      transportMock
    );
  });
});
