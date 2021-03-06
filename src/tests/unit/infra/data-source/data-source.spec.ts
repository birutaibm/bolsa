import { Factory } from '@utils/factory';
import { RepositoryFactoriesBuilder } from '@infra/data-source';
import { env } from '@infra/environment';
import { DatabaseConnectionError } from '@errors/database-connection';

describe('Repository factories builder', () => {
  it('should be able to create factories of all repositories', async done => {
    const factories = await new RepositoryFactoriesBuilder()
      .withMongo(env.mongodb)
      .withAlphavantage(env.externalPrices.alphavantageKey)
      .build();
    expect(factories).toBeInstanceOf(Object);
    expect(Object.keys(factories).length).toBe(3);
    expect(factories.prices).toBeInstanceOf(Factory);
    expect(factories.users).toBeInstanceOf(Factory);
    expect(factories.wallets).toBeInstanceOf(Factory);
    done();
  });

  it('should be able to create factories of all repositories without alphavantage', async done => {
    const factories = await new RepositoryFactoriesBuilder()
      .withMongo(env.mongodb)
      .build();
    expect(factories).toBeInstanceOf(Object);
    expect(Object.keys(factories).length).toBe(3);
    expect(factories.prices).toBeInstanceOf(Factory);
    expect(factories.users).toBeInstanceOf(Factory);
    expect(factories.wallets).toBeInstanceOf(Factory);
    done();
  });

  it('should not be able to create factories without mongo', async done => {
    await expect(
      new RepositoryFactoriesBuilder()
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .build()
    ).rejects.toBeInstanceOf(DatabaseConnectionError);
    done();
  });
});
