/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { ModelAggregate } from '../../../apis/model_aggregate';
import { render, screen, waitFor, within } from '../../../../test/test_utils';

import { ModelList } from '../index';

const setup = () => {
  const notificationsMock = {
    toasts: {
      get$: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
      addSuccess: jest.fn(),
      addWarning: jest.fn(),
      addDanger: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    },
  };
  const renderResult = render(<ModelList notifications={notificationsMock} />);
  return {
    renderResult,
    notificationsMock,
  };
};

describe('<ModelList />', () => {
  it('should empty screen if no models in system', async () => {
    const modelAggregateMock = jest
      .spyOn(ModelAggregate.prototype, 'search')
      .mockImplementation(() =>
        Promise.resolve({
          data: [],
          pagination: {
            currentPage: 1,
            pageSize: 15,
            totalPages: 0,
            totalRecords: 0,
          },
        })
      );

    setup();

    await waitFor(() => {
      expect(screen.getByText('Registered models will appear here.'));
    });

    modelAggregateMock.mockRestore();
  });

  it('should show model total count and model table after model data loaded', async () => {
    setup();

    await waitFor(() => {
      expect(within(screen.getByTestId('modelTotalCount')).getByText('(1)')).toBeInTheDocument();
      expect(
        screen.getByText('traced_small_model').closest('.euiTableRowCell')
      ).toBeInTheDocument();
      expect(screen.getByText('1.0.5').closest('.euiTableRowCell')).toBeInTheDocument();
    });
  });

  it('should render model list filter by default', () => {
    setup();

    expect(screen.getByPlaceholderText('Search by name, person, or keyword')).toBeInTheDocument();
    expect(
      screen.getByText(
        (text, node) => text === 'Owner' && !!node?.className.includes('euiFilterButton__textShift')
      )
    ).toBeInTheDocument();
  });
});
