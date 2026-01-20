/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';

import { ModelTable, ModelTableProps } from '../model_table';
import { render, screen, within } from '../../../../test/test_utils';

const tableData = [
  {
    id: '1',
    name: 'model1',
    owner_name: 'foo',
    latest_version: 5,
    description: 'model 1 description',
    deployed_versions: ['1,2'],
    last_updated_time: 1683699499637,
  },
];

const setup = (options?: Partial<ModelTableProps>) => {
  const onChangeMock = jest.fn();
  const onModelNameClickMock = jest.fn();
  const onResetClickMock = jest.fn();
  const renderResult = render(
    <ModelTable
      models={tableData}
      sort={{
        field: 'last_updated_time',
        direction: 'desc',
      }}
      onChange={onChangeMock}
      pagination={{ currentPage: 1, pageSize: 15, totalRecords: 300 }}
      loading={false}
      error={false}
      onResetClick={onResetClickMock}
      {...options}
    />
  );
  return {
    renderResult,
    onChangeMock,
    onModelNameClickMock,
    onResetClickMock,
  };
};

describe('<ModelTable />', () => {
  it('should render consistent table header', () => {
    setup();
    const tableHeaders = screen.queryAllByRole('columnheader');
    expect(within(tableHeaders[0]).getByText('Model Name')).toBeInTheDocument();
    expect(within(tableHeaders[1]).getByText('Latest version')).toBeInTheDocument();
    expect(within(tableHeaders[2]).getByText('Description')).toBeInTheDocument();
    expect(within(tableHeaders[3]).getByText('Owner')).toBeInTheDocument();
    expect(within(tableHeaders[4]).getByText('Deployed versions')).toBeInTheDocument();
    expect(within(tableHeaders[5]).getByText('Last updated')).toBeInTheDocument();
  });

  it('should render consistent table body', () => {
    const { renderResult } = setup();
    const model1FirstCellContent = renderResult.getByText(tableData[0].name);
    expect(model1FirstCellContent).toBeInTheDocument();
    const model1Cells = model1FirstCellContent.closest('tr')?.querySelectorAll('td');
    expect(model1Cells).not.toBeUndefined();
    expect(within(model1Cells!.item(1)).getByText(tableData[0].latest_version)).toBeInTheDocument();
    expect(within(model1Cells!.item(2)).getByText(tableData[0].description)).toBeInTheDocument();
    expect(within(model1Cells!.item(3)).getByText('f')).toBeInTheDocument();
    expect(
      within(model1Cells!.item(4)).getByText(tableData[0].deployed_versions.join(', '))
    ).toBeInTheDocument();
    expect(
      within(model1Cells!.item(5)).getByText('May 10, 2023 @ 06:18:19.637')
    ).toBeInTheDocument();
  });

  it('should call onChange with consistent params after pageSize change', async () => {
    const { renderResult, onChangeMock } = setup();
    expect(onChangeMock).not.toHaveBeenCalled();
    await userEvent.click(renderResult.getByText(/Rows per page/));
    await userEvent.click(renderResult.getByText('50 rows'));
    expect(onChangeMock).toHaveBeenCalledWith({
      pagination: {
        currentPage: 1,
        pageSize: 50,
      },
      sort: {
        field: 'last_updated_time',
        direction: 'desc',
      },
    });
  });

  it('should call onChange with consistent params after page change', async () => {
    const { renderResult, onChangeMock } = setup();
    expect(onChangeMock).not.toHaveBeenCalled();
    await userEvent.click(renderResult.getByTestId('pagination-button-next'));
    expect(onChangeMock).toHaveBeenCalledWith({
      pagination: {
        currentPage: 2,
        pageSize: 15,
      },
      sort: {
        field: 'last_updated_time',
        direction: 'desc',
      },
    });
  });

  it('should call onChange with consistent params after sort change', async () => {
    const { renderResult, onChangeMock } = setup();
    expect(onChangeMock).not.toHaveBeenCalled();
    await userEvent.click(renderResult.getByTitle('Last updated'));
    expect(onChangeMock).toHaveBeenCalledWith({
      pagination: {
        currentPage: 1,
        pageSize: 15,
      },
      sort: {
        field: 'last_updated_time',
        direction: 'asc',
      },
    });
  });

  it('should redirect to model detail page after model name click', async () => {
    const { renderResult } = setup();
    await userEvent.click(renderResult.getByText('model1'));
    expect(location.href).toContain('model-registry/model/1');
  });

  it('should show loading screen if property loading equal true', () => {
    setup({
      loading: true,
      error: false,
      models: [],
    });

    expect(screen.getByText('Loading models')).toBeInTheDocument();
  });

  it('should show error screen if property error equal true', () => {
    setup({
      loading: false,
      error: true,
      models: [],
    });

    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
  });

  it('should show no result screen if load empty data', () => {
    setup({
      loading: false,
      error: false,
      models: [],
    });

    expect(screen.getByText('Reset search and filters')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There are no results for your search. Reset the search criteria to view registered models.'
      )
    ).toBeInTheDocument();
  });

  it('should show loading screen even models provided', () => {
    setup({
      loading: true,
      error: false,
      models: tableData,
    });

    expect(screen.getByText('Loading models')).toBeInTheDocument();
  });

  it('should show error screen even models provided', () => {
    setup({
      loading: false,
      error: true,
      models: tableData,
    });

    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
  });

  it('should call onRestClick after reset button clicked', async () => {
    const { onResetClickMock } = setup({
      loading: false,
      error: false,
      models: [],
    });

    expect(onResetClickMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Reset search and filters'));
    expect(onResetClickMock).toHaveBeenCalled();
  });

  it('should navigate to model register version page after register version clicked', async () => {
    setup();

    await userEvent.click(
      within(screen.getByText('model1').closest('tr')!).getByLabelText('Register new version')
    );

    expect(location.href).toContain('model-registry/register-model/1');
  });
});
