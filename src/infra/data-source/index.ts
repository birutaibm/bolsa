import { Builder } from '@utils/factory';
import { DatabaseConnectionError } from '@errors/database-connection';

import { RepositoryFactories } from '@gateway/factories/repositories';

import Mongo, { MongoConfig } from '@infra/data-source/database/mongo';

import { PriceRepositoriesProviderBuilder } from './price-repositories';

export class RepositoryFactoriesBuilder extends Builder<Promise<RepositoryFactories>> {
  private mongo: Mongo;
  private alphavantageKey: string;

  withMongo(config: MongoConfig) {
    this.mongo = new Mongo(config);
    this.mongo.connect();
    return this;
  }

  withAlphavantage(key: string) {
    this.alphavantageKey = key;
    return this;
  }

  async build(): Promise<RepositoryFactories> {
    if (!this.mongo) {
      throw new DatabaseConnectionError('mongodb');
    }
    const mongoRepo = await this.mongo.createRepositoryFactories();
    const prices = new PriceRepositoriesProviderBuilder()
      .withInternal(mongoRepo.prices);
    if (this.alphavantageKey) {
      prices.withAlphavantageKey(this.alphavantageKey);
    }
    return {
      prices: prices.asSingletonFactory(),
      users: mongoRepo.users,
    };
  }
}
