import { DatabaseConnectionError } from '@errors/database-connection';
import { Builder, Factory } from '@utils/factory';

import {
  ExternalRepository, InternalPriceRepository, PriceRepositoriesProvider
} from '@gateway/data/contracts';

import { AlphavantagePriceRepository } from '@infra/data-source/api';

export class PriceRepositoriesProviderBuilder extends Builder<PriceRepositoriesProvider> {
  private internal: Factory<InternalPriceRepository>;
  private alphavantageKey: string;

  withInternal(internal: Factory<InternalPriceRepository>) {
    this.internal = internal;
    return this;
  }

  withAlphavantageKey(alphavantageKey: string) {
    this.alphavantageKey = alphavantageKey;
    return this;
  }

  build(): PriceRepositoriesProvider {
    if (!this.internal) {
      throw new DatabaseConnectionError('PostgreSQL');
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
