/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa, { ParseResult } from 'papaparse';
import { type Input_data, Rows } from '../types';

const MAX_DISPLAY_COLUMN_LENGTH = 150;

export const parseFile = (
  file: File,
  ifHeader: boolean,
  callback: (a: ParseResult<unknown> & { header?: any }) => void
) => {
  Papa.parse(file, {
    complete: function (results) {
      if (ifHeader) {
        const header = results.data.splice(0, 1);
        callback({
          ...results,
          header: header ? header[0] : null,
        });
      } else {
        callback(results);
      }
    },
    error: function (err) {
      console.error('err', err);
    },
  });
};

export const transToInputData = (parsedData: any, cols: number[]) => {
  const { data, header } = parsedData;
  const columns = cols.sort((a, b) => a - b);
  const input_data: Input_data = { column_metas: [], rows: [] };
  input_data.column_metas = columns.map((item) => ({
    name: header && header[item] ? header[item] : `d${item}`,
    column_type: 'DOUBLE',
  }));

  for (const item of data) {
    const res: Rows = { values: [] };
    columns.forEach((i: number) => {
      if (!item[i]) return;
      const row = {
        column_type: 'DOUBLE',
        value: Number(item[i]),
      };
      res.values.push(row);
    });
    if (res.values.length === columns.length) {
      input_data.rows.push(res);
    }
  }
  return input_data;
};

export const convertPredictionToTable = (data: Input_data) => {
  const { column_metas, rows } = data;
  const rows_length =
    rows.length > MAX_DISPLAY_COLUMN_LENGTH ? MAX_DISPLAY_COLUMN_LENGTH : rows.length;
  const columns = column_metas.map((item) => ({
    field: item.name,
    name: item.name,
  }));
  const items = [];
  for (let i = 0; i <= rows_length; i++) {
    const item: Record<string, string | number | boolean> = {};
    rows[i].values.forEach((_, index) => {
      const key = column_metas[index].name,
        value = rows[i].values[index].value;
      item[key] = value;
    });
    items.push(item);
  }
  return { columns, items };
};
