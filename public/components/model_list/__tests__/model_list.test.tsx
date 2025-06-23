/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelAggregate } from '../../../apis/model_aggregate';
import { render, screen, waitFor, within } from '../../../../test/test_utils';

import { ModelList } from '../index';

const setup = () => {
  render(<ModelList />);
};

describe('<ModelList />', () => {
  it('should show empty screen if no models in system', async () => {
    const modelAggregateMock = jest
      .spyOn(ModelAggregate.prototype, 'search')
      .mockImplementation(() =>
        Promise.resolve({
          data: [],
          total_models: 0,
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
      expect(screen.getByText('5').closest('.euiTableRowCell')).toBeInTheDocument();
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

  it('should call model aggregate with filter parameters after filter applied', async () => {
    setup();
    const modelAggregateSearchMock = jest.spyOn(ModelAggregate.prototype, 'search');

    await userEvent.click(screen.getByText('Deployed'));

    expect(modelAggregateSearchMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        states: ['DEPLOYED'],
      })
    );

    modelAggregateSearchMock.mockRestore();
  });

  it('should call model aggregate with extraQuery after search text typed', async () => {
    setup();
    const modelAggregateSearchMock = jest.spyOn(ModelAggregate.prototype, 'search');

    await userEvent.type(screen.getByPlaceholderText('Search by name, person, or keyword'), 'foo');

    await waitFor(() => {
      expect(modelAggregateSearchMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          extraQuery: JSON.stringify({
            bool: {
              should: [
                {
                  match_phrase: {
                    name: 'foo',
                  },
                },
                {
                  match_phrase: {
                    description: 'foo',
                  },
                },
                {
                  nested: {
                    path: 'owner',
                    query: {
                      term: {
                        'owner.name.keyword': {
                          value: 'foo',
                          boost: 1,
                        },
                      },
                    },
                  },
                },
              ],
            },
          }),
        })
      );
    });

    modelAggregateSearchMock.mockRestore();
  });
});
