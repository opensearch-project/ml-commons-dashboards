/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { screen, render } from '../../../../../test/test_utils';

import { ErrorCallOut } from '../error_call_out';

describe('<ErrorCallOut />', () => {
  it('should NOT render call out if errors is empty', () => {
    render(<ErrorCallOut errorMessages={[]} formErrors={{}} />);

    expect(screen.queryByLabelText('Address errors in the form')).toBeNull();
  });

  it('should render error call out if errors is not empty', () => {
    render(
      <ErrorCallOut
        errorMessages={[
          {
            field: 'name',
            type: 'required',
            message: 'Name: Enter a name.',
          },
          {
            field: 'name',
            type: 'duplicateNames',
            message: 'Name: Use a unique name.',
          },
          {
            field: 'modelFile',
            type: 'required',
            message: 'File: Add a file.',
          },
        ]}
        formErrors={{
          name: {
            type: 'multi',
            types: {
              required: 'name required',
              duplicateNames: 'name duplicate',
            },
          },
          modelFile: {
            type: 'required',
            message: 'Model file is required',
          },
        }}
      />
    );

    expect(screen.getByLabelText('Address errors in the form')).toBeInTheDocument();
    expect(screen.getByText(/Name: Enter a name./)).toBeInTheDocument();
    expect(screen.getByText(/Name: Use a unique name./)).toBeInTheDocument();
    expect(screen.getByText(/File: Add a file./)).toBeInTheDocument();
  });
});
