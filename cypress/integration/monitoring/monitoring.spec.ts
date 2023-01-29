/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH } from '../../support/constants';

describe('Documents layer', () => {
  before(() => {
    cy.visit(`${BASE_PATH}`, {
      retryOnStatusCodeFailure: true,
      timeout: 60000,
    });
  });

  it('should open home page', () => {
    cy.get('[data-test-subj="homeApp"]', { timeout: 10000 }).should('be.visible');
  });
});
