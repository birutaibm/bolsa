import { Factory } from '@utils/factory';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { env } from '@infra/environment';
import { DatabaseConnectionError } from '@errors/database-connection';

describe('Repository factories builder', () => {
  it('should be able to create factories of all repositories', async done => {
    const factories = await new RepositoryFactoriesBuilder()
      .withMongo(env.mongodb)
      .withPostgre(env.postgre)
      .withAlphavantage(env.externalPrices.alphavantageKey)
      .build();
    expect(factories).toBeInstanceOf(Object);
    expect(Object.keys(factories).length).toBe(7);
    expect(factories.prices).toBeInstanceOf(Factory);
    expect(factories.users).toBeInstanceOf(Factory);
    expect(factories.wallets).toBeInstanceOf(Factory);
    await factories.disconnectAll();
    done();
  });

  it('should be able to create factories of all repositories without alphavantage', async done => {
    const factories = await new RepositoryFactoriesBuilder()
      .withMongo(env.mongodb)
      .withPostgre(env.postgre)
      .build();
    expect(factories).toBeInstanceOf(Object);
    expect(Object.keys(factories).length).toBe(7);
    expect(factories.prices).toBeInstanceOf(Factory);
    expect(factories.users).toBeInstanceOf(Factory);
    expect(factories.wallets).toBeInstanceOf(Factory);
    await factories.disconnectAll();
    done();
  });

  it('should not be able to create factories without mongo', async done => {
    await expect(
      new RepositoryFactoriesBuilder()
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withPostgre(env.postgre)
        .build()
    ).rejects.toBeInstanceOf(DatabaseConnectionError);
    done();
  });

  it('should not be able to create factories without postgre', async done => {
    await expect(
      new RepositoryFactoriesBuilder()
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withMongo(env.mongodb)
        .build()
    ).rejects.toBeInstanceOf(DatabaseConnectionError);
    done();
  });
});
