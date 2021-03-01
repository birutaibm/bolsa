import { ExternalRepository, InternalRepository, PriceRepositoriesProvider } from '@gateway/data/contracts';

import { AlphavantagePriceRepository } from '@infra/data-source/api';
import { DatabaseConnectionError } from '@errors/database-connection';
import { Builder, Factory } from '@utils/factory';

export class PriceRepositoriesProviderBuilder extends Builder<PriceRepositoriesProvider> {
  private internal: Factory<InternalRepository>;
  private alphavantageKey: string;

  withInternal(internal: Factory<InternalRepository>) {
    this.internal = internal;
    return this;
  }

  withAlphavantageKey(alphavantageKey: string) {
    this.alphavantageKey = alphavantageKey;
    return this;
  }

  build(): PriceRepositoriesProvider {
    if (!this.internal) {
      throw new DatabaseConnectionError('mongodb');
    }
    const externals: ExternalRepository[] = []
    if (this.alphavantageKey) {
      externals.push(new AlphavantagePriceRepository(this.alphavantageKey));
    }
    return {
      internal: this.internal.make(),
      externals,
    };
  }
}
