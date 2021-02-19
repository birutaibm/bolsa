import { SingletonFactory } from '@utils/factory';

import { RepositoryFactories } from '@gateway/factories/repositories';

import { Mongo } from '@infra/data-source/database';

import { createPriceRepositories } from './price-repositories';
import { MongoUserRepository } from './mongo';

export function createRepositoryFactories(mongo: Mongo): RepositoryFactories {
  return {
    prices: new SingletonFactory(() => createPriceRepositories(mongo)),
    user:  new SingletonFactory(() => new MongoUserRepository(mongo)),
  };
}
