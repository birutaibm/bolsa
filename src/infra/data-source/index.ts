import { Builder } from '@utils/factory';
import { DatabaseConnectionError } from '@errors/database-connection';

import { RepositoryFactories } from '@gateway/factories/repositories';

import Mongo, { MongoConfig } from '@infra/data-source/database/mongo';
import PostgreSQL, { PostgreConfig } from '@infra/data-source/database/postgresql';

import { PriceRepositoriesProviderBuilder } from './price-repositories';

export class RepositoryFactoriesBuilder extends Builder<RepositoryFactories> {
  private mongo: Mongo;
  private postgre: PostgreSQL;
  private alphavantageKey: string;

  withMongo(config: MongoConfig) {
    this.mongo = new Mongo(config);
    return this;
  }

  withPostgre(config: PostgreConfig) {
    this.postgre = new PostgreSQL(config);
    return this;
  }

  getPostgreSQL() {
    return this.postgre;
  }

  withAlphavantage(key: string) {
    this.alphavantageKey = key;
    return this;
  }

  private ensureDBReady() {
    if (!this.mongo) {
      if (!this.postgre) {
        throw new DatabaseConnectionError('mongodb and postgreSQL');
      } else {
        this.postgre.disconnect();
        throw new DatabaseConnectionError('mongodb');
      }
    } else {
      if (!this.postgre) {
        this.mongo.disconnect();
        throw new DatabaseConnectionError('postgreSQL');
      }
    }
  }

  build(): RepositoryFactories {
    console.log('Creating RepositoryFactories...');
    this.ensureDBReady();
    const mongoRepo = this.mongo.createRepositoryFactories();
    const prices = new PriceRepositoriesProviderBuilder()
      .withInternal(mongoRepo.prices);
    if (this.alphavantageKey) {
      prices.withAlphavantageKey(this.alphavantageKey);
    }
    const postgreRepo = this.postgre.createRepositoryFactories();

    const disconnectAll = () => {
      const connections = [this.mongo, this.postgre].filter(db => db !== undefined);
      const promises = connections.map(con => con.disconnect());
      return Promise.all(promises);
    };
    console.log('RepositoryFactories created');

    return {
      disconnectAll,
      prices: prices.asSingletonFactory(),
      users: postgreRepo.users,
      wallets: postgreRepo.wallets,
      investors: postgreRepo.investors,
      positions: postgreRepo.positions,
      operations: postgreRepo.operations,
    };
  }
}
