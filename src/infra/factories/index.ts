import {
  createControllerFactories, createUseCasesFactories
} from '@gateway/factories';

import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';
import { createRepositoryFactories } from '@infra/data-source/repositories';

import securityFactory from './security';

const mongo = new Mongo(env.mongodb);

export { securityFactory };

export const repositoryFactories =
  createRepositoryFactories(mongo);

export const useCasesFactories =
  createUseCasesFactories(repositoryFactories, securityFactory);

export const controllerFactories =
  createControllerFactories(useCasesFactories);
