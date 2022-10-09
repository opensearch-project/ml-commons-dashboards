/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import type { InputData, Rows, ParsedData, ParsedResult } from '../types';

const MAX_DISPLAY_COLUMN_LENGTH = 150;
const MAX_ROWS_LIMIT = 10000;

export const parseFile = (file: File, ifHeader: boolean, callback: (a: ParsedData) => void) => {
  Papa.parse(file, {
    complete(results: ParsedResult) {
      if (ifHeader) {
        const header = results.data.splice(0, 1);
        callback({
          ...results,
          header: header ? header[0] : undefined,
        });
      } else {
        callback(results);
      }
    },
    error(err) {
      // TODO: handle parse error
      // eslint-disable-next-line no-console
      console.error('err', err);
    },
  });
};

export const transParsedDataToInputData = (parsedData: ParsedData, cols: number[]) => {
  const { data, header } = parsedData;
  const columns = cols.sort((a, b) => a - b);
  const inputData: InputData = { column_metas: [], rows: [] };
  inputData.column_metas = columns.map((item) => ({
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
    if (res.values.length === columns.length && inputData.rows.length < MAX_ROWS_LIMIT) {
      inputData.rows.push(res);
    }
  }
  return inputData;
};

export const convertPredictionResultToTable = (data: InputData) => {
  const { column_metas: columnMetas, rows } = data;
  const rowsLength =
    rows.length > MAX_DISPLAY_COLUMN_LENGTH ? MAX_DISPLAY_COLUMN_LENGTH : rows.length;
  const columns = columnMetas.map((item) => ({
    field: item.name,
    name: item.name,
  }));
  const items = [];
  for (let i = 0; i <= rowsLength; i++) {
    const item: Record<string, string | number | boolean> = {};
    rows[i].values.forEach((_, index) => {
      const key = columnMetas[index].name;
      const value = rows[i].values[index].value;
      item[key] = value;
    });
    items.push(item);
  }
  return { columns, items };
};
