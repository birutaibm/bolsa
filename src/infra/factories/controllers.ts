import { createControllerFactories, createUseCasesFactories } from '@gateway/factories';

import { Mongo } from '@infra/data-source/database';
import { env } from '@infra/environment';

import securityFactory from './security';
import { createRepositoryFactories } from './repositories';

const mongo = new Mongo(env.mongodb);

const repositories = createRepositoryFactories(mongo);

const useCases = createUseCasesFactories(repositories, securityFactory);

export const controllerFactories = createControllerFactories(useCases);
