/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { render, screen } from '../../../../test/test_utils';

import { ModelListEmpty } from '../model_list_empty';

describe('<ModelListEmpty />', () => {
  it('should show tips, register model and Read documentation by default', () => {
    render(<ModelListEmpty />);

    expect(screen.getByText('Registered models will appear here.'));
    expect(screen.getByText('Register model'));
    expect(screen.getByText('Read documentation'));
    expect(screen.getByText('Read documentation')).toHaveProperty('href', 'http://localhost/todo');
  });
});
