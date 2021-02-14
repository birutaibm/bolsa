import { SingletonFactory } from '@utils/factory';

import { RepositoryFactories } from '@gateway/factories/repositories';

import { Mongo } from '@infra/data-source/database';
import { FakeUserRepository } from '@infra/data-source/repositories';
import { MongoUserRepository } from '@infra/data-source/repositories/mongo-user';

import { PriceRepositories } from './price-repositories';
import { FakeRankingRepository } from '@infra/data-source/repositories';

export function createRepositoryFactories(mongo?: Mongo): RepositoryFactories {
  return {
    ranking: new SingletonFactory(() => new FakeRankingRepository()),
    prices: new SingletonFactory(() => new PriceRepositories(mongo)),
    user:  new SingletonFactory(() => mongo
      ? new MongoUserRepository(mongo)
      : new FakeUserRepository()
    ),
  };
}
