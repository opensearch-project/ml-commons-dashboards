/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import 'babel-polyfill';
import fetch, { Request, Response } from 'node-fetch';

import { setupDashboard } from './setup_dashboard';

// @ts-ignore
global.Request = Request;

// @ts-ignore
global.Response = Response;

global.fetch = fetch;

setupDashboard();
