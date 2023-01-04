/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { combineReducers } from 'redux';

export const rootReducer = combineReducers({ root: () => true });

export type RootState = ReturnType<typeof rootReducer>;
