/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connector } from './connector';
import { Model } from './model';
import { Profile } from './profile';

const apiInstanceStore: {
  model: Model | undefined;
  profile: Profile | undefined;
  connector: Connector | undefined;
} = {
  model: undefined,
  profile: undefined,
  connector: undefined,
};

export class APIProvider {
  public static getAPI(type: 'model'): Model;
  public static getAPI(type: 'profile'): Profile;
  public static getAPI(type: 'connector'): Connector;
  public static getAPI(type: keyof typeof apiInstanceStore) {
    if (apiInstanceStore[type]) {
      return apiInstanceStore[type]!;
    }
    switch (type) {
      case 'model': {
        const newInstance = new Model();
        apiInstanceStore.model = newInstance;
        return newInstance;
      }
      case 'profile': {
        const newInstance = new Profile();
        apiInstanceStore.profile = newInstance;
        return newInstance;
      }
      case 'connector': {
        const newInstance = new Connector();
        apiInstanceStore.connector = newInstance;
        return newInstance;
      }
    }
  }
  public static clear() {
    apiInstanceStore.model = undefined;
    apiInstanceStore.profile = undefined;
    apiInstanceStore.connector = undefined;
  }
}
