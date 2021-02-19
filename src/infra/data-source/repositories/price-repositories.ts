import { PriceRepositoriesProvider } from '@gateway/data/contracts';

import { env } from '@infra/environment';

import { Mongo } from '@infra/data-source/database';

import { MongoPriceRepository } from './mongo';
import { AlphavantagePriceRepository } from './alphavantage-price';

export function createPriceRepositories(mongo: Mongo): PriceRepositoriesProvider {
  return {
    internal: new MongoPriceRepository(mongo),
    externals: [
      new AlphavantagePriceRepository(env.externalPrices.alphavantageKey),
    ],
  };
}
