/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connector } from './connector';
import { ModelVersion } from './model_version';
import { ModelAggregate } from './model_aggregate';
import { Model } from './model';
import { ModelRepository } from './model_repository';
import { Profile } from './profile';
import { Security } from './security';
import { Task } from './task';

const apiInstanceStore: {
  modelVersion: ModelVersion | undefined;
  modelAggregate: ModelAggregate | undefined;
  profile: Profile | undefined;
  connector: Connector | undefined;
  security: Security | undefined;
  task: Task | undefined;
  modelRepository: ModelRepository | undefined;
  model: Model | undefined;
} = {
  modelVersion: undefined,
  modelAggregate: undefined,
  profile: undefined,
  connector: undefined,
  security: undefined,
  task: undefined,
  modelRepository: undefined,
  model: undefined,
};

export class APIProvider {
  public static getAPI(type: 'task'): Task;
  public static getAPI(type: 'modelVersion'): ModelVersion;
  public static getAPI(type: 'modelAggregate'): ModelAggregate;
  public static getAPI(type: 'profile'): Profile;
  public static getAPI(type: 'connector'): Connector;
  public static getAPI(type: 'security'): Security;
  public static getAPI(type: 'modelRepository'): ModelRepository;
  public static getAPI(type: 'model'): Model;
  public static getAPI(type: keyof typeof apiInstanceStore) {
    if (apiInstanceStore[type]) {
      return apiInstanceStore[type]!;
    }
    switch (type) {
      case 'modelVersion': {
        const newInstance = new ModelVersion();
        apiInstanceStore.modelVersion = newInstance;
        return newInstance;
      }
      case 'modelAggregate': {
        const newInstance = new ModelAggregate();
        apiInstanceStore.modelAggregate = newInstance;
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
      case 'security': {
        const newInstance = new Security();
        apiInstanceStore.security = newInstance;
        return newInstance;
      }
      case 'task': {
        const newInstance = new Task();
        apiInstanceStore.task = newInstance;
        return newInstance;
      }
      case 'modelRepository': {
        const newInstance = new ModelRepository();
        apiInstanceStore.modelRepository = newInstance;
        return newInstance;
      }
      case 'model': {
        const newInstance = new Model();
        apiInstanceStore.model = newInstance;
        return newInstance;
      }
    }
  }
  public static clear() {
    Object.keys(apiInstanceStore).forEach((key) => {
      apiInstanceStore[key as keyof typeof apiInstanceStore] = undefined;
    });
  }
}
