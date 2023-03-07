/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { screen } from '../../../../test/test_utils';
import { setup } from './setup';

describe('<RegisterModel /> Configuration', () => {
  it('should render a help flyout when click help button', async () => {
    const { user } = await setup();
    expect(screen.getByLabelText('Configuration in JSON')).toBeInTheDocument();
    await user.click(screen.getByTestId('model-configuration-help-button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
