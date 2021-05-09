import { Factories, securityFactory } from '@infra/factories';
import { env } from '@infra/environment';
import { Mongo } from '@infra/data-source/database';
import { RepositoryFactoriesBuilder } from '@infra/data-source';

let mongo: Mongo;
let factories: Factories;

describe('Factories at infra', () => {
  beforeAll(async done => {
    mongo = new Mongo(env.mongodb);
    factories = new Factories(
      new RepositoryFactoriesBuilder()
        .withMongo(env.mongodb)
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withPostgre(env.postgre)
        .build(),
      securityFactory,
    );
    try {
      mongo.connect();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      mongo.disconnect();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to reuse instance of security factories', async (done) => {
    const instance = factories.ofSecurity();
    expect(factories.ofSecurity()).toBe(instance);
    done();
  });

  it('should be able to reuse instance of use-cases factories', async (done) => {
    const instance = factories.ofUseCases();
    expect(factories.ofUseCases()).toBe(instance);
    done();
  });

  it('should be able to reuse instance of controllers factories', async (done) => {
    const instance = factories.ofControllers();
    expect(factories.ofControllers()).toBe(instance);
    done();
  });
});
