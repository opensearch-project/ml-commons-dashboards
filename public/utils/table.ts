/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';

export const DEFAULT_EMPTY_DATA = '-';

export const renderTime = (time: string | number, format = 'MM/DD/YY h:mm a') => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format(format);
  return DEFAULT_EMPTY_DATA;
};
