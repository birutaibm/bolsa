import { Builder } from '@utils/factory';
import { DatabaseConnectionError } from '@errors/database-connection';

import { RepositoryFactories } from '@gateway/factories/repositories';

import PostgreSQL, { PostgreConfig } from '@infra/data-source/database/postgresql';

import { PriceRepositoriesProviderBuilder } from './price-repositories';

export class RepositoryFactoriesBuilder extends Builder<RepositoryFactories> {
  private postgre: PostgreSQL;
  private alphavantageKey: string;

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
      if (!this.postgre) {
        throw new DatabaseConnectionError('postgreSQL');
      }
  }

  build(): RepositoryFactories {
    console.log('Creating RepositoryFactories...');
    this.ensureDBReady();
    const postgreRepo = this.postgre.createRepositoryFactories();
    const prices = new PriceRepositoriesProviderBuilder()
      .withInternal(postgreRepo.prices);
    if (this.alphavantageKey) {
      prices.withAlphavantageKey(this.alphavantageKey);
    }

    const disconnectAll = () => {
      const connections = [this.postgre].filter(db => db !== undefined);
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
