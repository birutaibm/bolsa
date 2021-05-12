import { SingletonFactory } from '@utils/factory';
import { DatabaseConnectionError } from '@errors/database-connection';

import { PriceRepositoriesProviderBuilder } from '@infra/data-source/price-repositories';
import { AlphavantagePriceRepository } from '@infra/data-source/api';

import { FakePriceRepository } from '@mock/data-source/repositories';

describe('Price repositories provider builder', () => {
  it('should be able to create PriceRepositoriesProvider', () => {
    const internal = new FakePriceRepository();
    const provider = new PriceRepositoriesProviderBuilder()
      .withAlphavantageKey('my_key')
      .withInternal(new SingletonFactory(() => internal))
      .build();
    expect(provider).toBeInstanceOf(Object);
    expect(provider.internal).toBe(internal);
    expect(provider.externals.length).toBe(1);
    expect(provider.externals[0]).toBeInstanceOf(AlphavantagePriceRepository);
  });

  it('should not be able to create PriceRepositoriesProvider without any internal', () => {
    const builder = new PriceRepositoriesProviderBuilder()
      .withAlphavantageKey('my_key');
    expect(() => builder.build()).toThrowError(DatabaseConnectionError)
  });

  it('should be able to create PriceRepositoriesProvider without any external', () => {
    const internal = new FakePriceRepository();
    const provider = new PriceRepositoriesProviderBuilder()
      .withInternal(new SingletonFactory(() => internal))
      .build();
    expect(provider).toBeInstanceOf(Object);
    expect(provider.internal).toBe(internal);
    expect(provider.externals.length).toBe(0);
  });
});
