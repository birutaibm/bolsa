import { Factories, securityFactory } from '@infra/factories';
import { env } from '@infra/environment';
import { RepositoryFactoriesBuilder } from '@infra/data-source';

let factories: Factories;

describe('Factories at infra', () => {
  beforeAll(() => {
    factories = new Factories(
      new RepositoryFactoriesBuilder()
        .withAlphavantage(env.externalPrices.alphavantageKey)
        .withPostgre(env.postgre)
        .build(),
      securityFactory(env.jwt),
    );
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
