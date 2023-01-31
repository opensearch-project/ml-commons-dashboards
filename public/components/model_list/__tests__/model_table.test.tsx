/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import moment from 'moment';
import userEvent from '@testing-library/user-event';

import { ModelTable } from '../model_table';
import { render, screen, within } from '../../../../test/test_utils';
import { MODEL_STATE } from '../../../../common/model';

const tableData = [
  {
    name: 'model1',
    owner: 'foo',
    latest_version: '5',
    description: 'model 1 description',
    latest_version_state: MODEL_STATE.loaded,
    deployed_versions: ['1,2'],
    created_time: Date.now(),
  },
  {
    name: 'model2',
    owner: 'bar',
    latest_version: '3',
    description: 'model 2 description',
    latest_version_state: MODEL_STATE.uploading,
    deployed_versions: ['1,2'],
    created_time: Date.now(),
  },
];

const setup = () => {
  const onChangeMock = jest.fn();
  const onModelNameClickMock = jest.fn();
  const renderResult = render(
    <ModelTable
      models={tableData}
      sort={{
        field: 'created_time',
        direction: 'desc',
      }}
      onChange={onChangeMock}
      onModelNameClick={onModelNameClickMock}
      pagination={{ currentPage: 1, pageSize: 15, totalRecords: 300 }}
    />
  );
  return {
    renderResult,
    onChangeMock,
    onModelNameClickMock,
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
    expect(within(tableHeaders[5]).getByText('Created at')).toBeInTheDocument();
  });

  it('should render consistent table body', () => {
    const { renderResult } = setup();
    const model1FirstCellContent = renderResult.getByText(tableData[0].name);
    expect(model1FirstCellContent).toBeInTheDocument();
    const model1Cells = model1FirstCellContent.closest('tr')?.querySelectorAll('td');
    expect(model1Cells).not.toBeUndefined();
    expect(within(model1Cells!.item(1)).getByText(tableData[0].latest_version)).toBeInTheDocument();
    expect(within(model1Cells!.item(2)).getByText(tableData[0].description)).toBeInTheDocument();
    expect(
      within(model1Cells!.item(3)).getByText(tableData[0].owner.slice(0, 1))
    ).toBeInTheDocument();
    expect(
      within(model1Cells!.item(4)).getByText(tableData[0].deployed_versions.join(', '))
    ).toBeInTheDocument();
    expect(
      within(model1Cells!.item(5)).getByText(
        moment(tableData[0].created_time).format('MMM D, YYYY')
      )
    ).toBeInTheDocument();

    const model2FirstCellContent = renderResult.getByText('New model');
    expect(model2FirstCellContent).toBeInTheDocument();
    const model2Cells = model2FirstCellContent.closest('tr')?.querySelectorAll('td');
    expect(model2Cells).not.toBeUndefined();
    expect(within(model2Cells!.item(1)).getByRole('progressbar')).toBeInTheDocument();
    expect(within(model2Cells!.item(2)).getByText('...')).toBeInTheDocument();
    expect(within(model2Cells!.item(3)).getByRole('progressbar')).toBeInTheDocument();
    expect(within(model2Cells!.item(4)).getByText('updating')).toBeInTheDocument();
    expect(within(model2Cells!.item(5)).getByText('updating')).toBeInTheDocument();
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
        field: 'created_time',
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
        field: 'created_time',
        direction: 'desc',
      },
    });
  });

  it('should call onChange with consistent params after sort change', async () => {
    const { renderResult, onChangeMock } = setup();
    expect(onChangeMock).not.toHaveBeenCalled();
    await userEvent.click(renderResult.getByTitle('Created at'));
    expect(onChangeMock).toHaveBeenCalledWith({
      pagination: {
        currentPage: 1,
        pageSize: 15,
      },
      sort: {
        field: 'created_time',
        direction: 'asc',
      },
    });
  });

  it('should call onModelNameClick with consistent params after model name click', async () => {
    const { renderResult, onModelNameClickMock } = setup();
    expect(onModelNameClickMock).not.toHaveBeenCalled();
    await userEvent.click(renderResult.getByText('model1'));
    expect(onModelNameClickMock).toHaveBeenCalledWith('model1');
  });
});
