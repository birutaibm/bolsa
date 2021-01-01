import { LastPriceLoaderService } from '@data/services';
import { ExternalPriceRepository } from '@data/utils';
import { Mongo } from '@infra/database';
import { MongoPriceRepository, LoadAlphavantagePriceRepository, FakePriceRepository } from '@infra/repositories';

export function makeLastPriceLoader(mongo?: Mongo): LastPriceLoaderService {
  const repo = mongo
    ? new MongoPriceRepository(mongo)
    : new FakePriceRepository();
  const alphavantage = new LoadAlphavantagePriceRepository();
  return new LastPriceLoaderService(
    repo,
    new ExternalPriceRepository('alphavantage', alphavantage, repo, repo, alphavantage),
  );
}
