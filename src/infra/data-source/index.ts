import { Builder } from '@utils/factory';
import { DatabaseConnectionError } from '@errors/database-connection';

import { RepositoryFactories } from '@gateway/factories/repositories';

import Mongo, { MongoConfig } from '@infra/data-source/database/mongo';
import PostgreSQL, { PostgreConfig } from '@infra/data-source/database/postgresql';

import { PriceRepositoriesProviderBuilder } from './price-repositories';

export class RepositoryFactoriesBuilder extends Builder<Promise<RepositoryFactories>> {
  private mongo: Mongo;
  private postgre: PostgreSQL;
  private alphavantageKey: string;

  withMongo(config: MongoConfig) {
    this.mongo = new Mongo(config);
    this.mongo.connect();
    return this;
  }

  withPostgre(config: PostgreConfig) {
    this.postgre = new PostgreSQL(config);
    return this;
  }

  withAlphavantage(key: string) {
    this.alphavantageKey = key;
    return this;
  }

  private async ensureDBReady() {
    if (!this.mongo) {
      if (!this.postgre) {
        throw new DatabaseConnectionError('mongodb and postgreSQL');
      } else {
        await this.postgre.disconnect();
        throw new DatabaseConnectionError('mongodb');
      }
    } else {
      if (!this.postgre) {
        await this.mongo.disconnect();
        throw new DatabaseConnectionError('postgreSQL');
      }
    }
  }

  async build(): Promise<RepositoryFactories> {
    await this.ensureDBReady();
    const mongoRepo = await this.mongo.createRepositoryFactories();
    const prices = new PriceRepositoriesProviderBuilder()
      .withInternal(mongoRepo.prices);
    if (this.alphavantageKey) {
      prices.withAlphavantageKey(this.alphavantageKey);
    }
    const postgreRepo = await this.postgre.createRepositoryFactories(mongoRepo.prices);

    const disconnectAll = async () => {
      const connections = [this.mongo, this.postgre].filter(db => db !== undefined);
      Promise.all(connections.map(con => con.disconnect));
    };

    return {
      disconnectAll,
      prices: prices.asSingletonFactory(),
      users: mongoRepo.users,
      wallets: postgreRepo.wallets,
      investors: postgreRepo.investors,
      positions: postgreRepo.positions,
      operations: postgreRepo.operations,
    };
  }
}
