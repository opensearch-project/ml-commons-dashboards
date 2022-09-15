/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
    EuiCallOut, EuiLink, EuiSpacer, EuiTextColor
} from '@elastic/eui';
import { TrainingResult } from './index'
import { Link, generatePath } from 'react-router-dom';
import { routerPaths } from '../../../common/router_paths';


type Props = {
    trainingResult: TrainingResult
}

export const TrainResult = ({ trainingResult }: Props) => {
    const { status, id, message } = trainingResult;

    return (
        <>
            <EuiSpacer />
            {status ? status === 'success' ? <EuiCallOut title="Trainning Success!" color="success" iconType="user">
                <p>
                    The model training is successful! 🎉  Model id is <EuiTextColor color="success">{id}</EuiTextColor> .Go{' '}
                    <Link to={generatePath(routerPaths.modelDetail, { id })}><EuiLink href="#">model detail for more information</EuiLink></Link>.
                </p>
            </EuiCallOut> : <EuiCallOut title="Trainning Error" color="danger" iconType="alert">
                <p>
                    The model training is failed!.Error message is <EuiTextColor color="danger">{message}</EuiTextColor>.
                </p>
            </EuiCallOut> : ''}
        </>
    );
};